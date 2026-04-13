import React, { useState } from 'react';
import './AccountManagement.css';
import fetchWithAuth from "../fetchWithAuth";
function AccountManagement() {
  // Get user from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : {};

  const [userData, setUserData] = useState({
    nom: user.nom || '',
    email: user.email || '',
    telephone: user.phonenumber || '',
    specialite: user.roles ? user.roles[0] : '',
    numeroLicence: user.numeroLicence || '', // Adjust if you have this field
    prenom: user.prenom || '',
    adresse: user.adresse || '',
    date_naissance: user.date_naissance || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData(formData);
    setIsEditing(false);
  };

  return (
    <div className="account-container">
      <h2>Gestion du Compte</h2>
      <div className="account-content">
        {!isEditing ? (
          <div className="account-info">
            <div className="info-group">
              <label>Nom</label>
              <p>{userData.nom}</p>
            </div>
            <div className="info-group">
              <label>Prénom</label>
              <p>{userData.prenom}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{userData.email}</p>
            </div>
            <div className="info-group">
              <label>Téléphone</label>
              <p>{userData.telephone}</p>
            </div>
            <div className="info-group">
              <label>Adresse</label>
              <p>{userData.adresse}</p>
            </div>
            <div className="info-group">
              <label>Date de naissance</label>
              <p>{userData.date_naissance}</p>
            </div>
            <div className="info-group">
              <label>Spécialité</label>
              <p>{userData.specialite}</p>
            </div>
            <div className="info-group">
              <label>Numéro de Licence</label>
              <p>{userData.numeroLicence}</p>
            </div>
            <button 
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Date de naissance</label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Spécialité</label>
              <input
                type="text"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Numéro de Licence</label>
              <input
                type="text"
                name="numeroLicence"
                value={formData.numeroLicence}
                onChange={handleChange}
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-button">
                Enregistrer
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ ...userData });
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AccountManagement;