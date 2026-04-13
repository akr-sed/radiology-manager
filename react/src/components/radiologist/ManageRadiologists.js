import React, { useEffect, useState } from 'react';
import './ManageRadiologists.css';
import fetchWithAuth from "../fetchWithAuth";
import config from '../../config';

function ManageRadiologists() {
  const [radiologists, setRadiologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRadiologist, setEditingRadiologist] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchRadiologists();
  }, []);

  const fetchRadiologists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth("http://"+config.DjangoHost+"/api/radiologues/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setRadiologists(data.radiologues);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des radiologues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce radiologue ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetchWithAuth(`http://${config.DjangoHost}/api/radiologues/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setRadiologists(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const openModal = (radiologist = null) => {
    setEditingRadiologist(radiologist);
    if (radiologist) {
      setFormData({
        nom: radiologist.nom,
        prenom: radiologist.prenom,
        email: radiologist.email,
        password: ''
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRadiologist(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingRadiologist ? 'PUT' : 'POST';
      const url = editingRadiologist
        ? `http://`+config.DjangoHost+`/api/radiologues/${editingRadiologist.id}/`
        : `http://${config.DjangoHost}/api/radiologues/`;

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchRadiologists();
        closeModal();
      } else {
        alert('Erreur: ' + (data.message || 'Impossible de sauvegarder.'));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="manage-radiologists">
      <h1>Gérer les Radiologues</h1>
      <button className="add-button" onClick={() => openModal()}>Ajouter un Radiologue</button>
      <table className="radiologists-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {radiologists.map(r => (
            <tr key={r.id}>
              <td>{r.nom}</td>
              <td>{r.prenom}</td>
              <td>{r.email}</td>
              <td>
                <button className="edit-button" onClick={() => openModal(r)}>Modifier</button>
                <button className="delete-button" onClick={() => handleDelete(r.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingRadiologist ? 'Modifier' : 'Ajouter'} Radiologue</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingRadiologist}
              />
              <div className="modal-actions">
                <button type="submit" className="save-button">Enregistrer</button>
                <button type="button" className="cancel-button" onClick={closeModal}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageRadiologists;

