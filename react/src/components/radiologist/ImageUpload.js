import React, { useState } from 'react';
import './ImageUpload.css';
import fetchWithAuth from "../fetchWithAuth";
import config from '../../config';

function ImageUpload({ patientId, imageType, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('image_type', imageType);
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetchWithAuth("http://"+config.DjangoHost+":8000/api/patient/addimg/", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      console.log('Upload réussi');
      onUploadComplete();
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload : ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <h3>Upload {imageType}</h3>
      <div className="upload-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="upload-button"
        >
          {uploading ? "Envoi en cours..." : "Enregistrer l'image"}
        </button>
      </div>
    </div>
  );
}

export default ImageUpload;
