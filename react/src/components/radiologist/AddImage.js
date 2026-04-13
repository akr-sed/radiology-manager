import React, { useState } from 'react';
import './AddImage.css';
import fetchWithAuth from "../fetchWithAuth";
import config from '../../config';

function AddImage({ patientId, imageType, onClose, onSave }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Veuillez sélectionner une image.');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('access_token');

      const formData = new FormData();
      formData.append('patient_id', patientId);
      formData.append('image_type', imageType); // ✅ clé alignée au backend
      formData.append('file', selectedFile);
      formData.append('date', date);
      formData.append('description', description);
      
      const response = await fetchWithAuth("http://"+config.DjangoHost+":8000/api/patient/addimg/", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload de l\'image');
      }

      const result = await response.json();
      console.log('Upload réussi:', result);

      // ✅ Use backend URL if present, fallback to local blob
      const imageData = {
        id: result.id || Date.now(),
        patientId,
        modalite: imageType,
        description: description,
        date: date,
        url: result.url || URL.createObjectURL(selectedFile),
      };

      // 🔑 Appel du parent pour MAJ instantanée
      onSave(imageData);

      // ✅ Fermer le modal
      onClose();
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-image-overlay">
      <div className="add-image-modal">
        <h2>Ajouter une image {imageType}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sélectionner l'image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              required
            />
          </div>
          <div className="form-group">
            <label>Date de l'examen</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="save-button" disabled={uploading}>
              {uploading ? 'Envoi...' : 'Enregistrer'}
            </button>
            <button type="button" className="cancel-button" onClick={onClose} disabled={uploading}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddImage;
