import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Lock, Save } from 'lucide-react';
import fetchWithAuth from '../fetchWithAuth';
import API_BASE from '../../config';
import './Shared.css';

export default function AccountManagement() {
  // Profile state
  const [profile, setProfile] = useState({
    nom: '',
    prenom: '',
    email: '',
    phonenumber: '',
    adresse: '',
    date_naissance: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [passwords, setPasswords] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirmer_mot_de_passe: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load user data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setProfile({
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          phonenumber: user.phonenumber || '',
          adresse: user.adresse || '',
          date_naissance: user.date_naissance || '',
        });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/api/modifier-compte/`, {
        method: 'PUT',
        body: JSON.stringify({
          nom: profile.nom,
          prenom: profile.prenom,
          phonenumber: profile.phonenumber,
          adresse: profile.adresse,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        // Update localStorage with new data
        const stored = localStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          const updatedUser = { ...user, ...data.data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setProfileSuccess('Profil mis à jour avec succès.');
      } else {
        setProfileError(data.message || 'Erreur lors de la mise à jour du profil.');
      }
    } catch {
      setProfileError('Erreur de connexion au serveur.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!passwords.ancien_mot_de_passe || !passwords.nouveau_mot_de_passe || !passwords.confirmer_mot_de_passe) {
      setPasswordError('Tous les champs sont requis.');
      return;
    }

    if (passwords.nouveau_mot_de_passe !== passwords.confirmer_mot_de_passe) {
      setPasswordError('Le nouveau mot de passe et la confirmation ne correspondent pas.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/api/changer-mot-de-passe/`, {
        method: 'PUT',
        body: JSON.stringify({
          ancien_mot_de_passe: passwords.ancien_mot_de_passe,
          nouveau_mot_de_passe: passwords.nouveau_mot_de_passe,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setPasswordSuccess('Mot de passe modifié avec succès.');
        setPasswords({
          ancien_mot_de_passe: '',
          nouveau_mot_de_passe: '',
          confirmer_mot_de_passe: '',
        });
      } else {
        setPasswordError(data.message || 'Erreur lors du changement de mot de passe.');
      }
    } catch {
      setPasswordError('Erreur de connexion au serveur.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '20px',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const successAlertStyle = {
    background: '#dcfce7',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  };

  const errorAlertStyle = {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  };

  const iconLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Section 1: Profile Information */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>
          <User size={22} />
          Mon Profil
        </div>

        {profileSuccess && <div style={successAlertStyle}>{profileSuccess}</div>}
        {profileError && <div style={errorAlertStyle}>{profileError}</div>}

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={iconLabelStyle}>
                <User size={14} /> Nom
              </label>
              <input
                type="text"
                name="nom"
                value={profile.nom}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label style={iconLabelStyle}>
                <User size={14} /> Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={profile.prenom}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label style={iconLabelStyle}>
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label style={iconLabelStyle}>
                <Phone size={14} /> Téléphone
              </label>
              <input
                type="text"
                name="phonenumber"
                value={profile.phonenumber}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label style={iconLabelStyle}>
                <MapPin size={14} /> Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={profile.adresse}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label style={iconLabelStyle}>
                <Calendar size={14} /> Date de naissance
              </label>
              <input
                type="date"
                name="date_naissance"
                value={profile.date_naissance}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={profileLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {profileLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Change Password */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>
          <Lock size={22} />
          Changer le mot de passe
        </div>

        {passwordSuccess && <div style={successAlertStyle}>{passwordSuccess}</div>}
        {passwordError && <div style={errorAlertStyle}>{passwordError}</div>}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label style={iconLabelStyle}>
              <Lock size={14} /> Ancien mot de passe
            </label>
            <input
              type="password"
              name="ancien_mot_de_passe"
              value={passwords.ancien_mot_de_passe}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-group">
            <label style={iconLabelStyle}>
              <Lock size={14} /> Nouveau mot de passe
            </label>
            <input
              type="password"
              name="nouveau_mot_de_passe"
              value={passwords.nouveau_mot_de_passe}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-group">
            <label style={iconLabelStyle}>
              <Lock size={14} /> Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmer_mot_de_passe"
              value={passwords.confirmer_mot_de_passe}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={passwordLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={16} />
              {passwordLoading ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
