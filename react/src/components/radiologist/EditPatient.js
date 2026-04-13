import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './EditPatient.css';
import fetchWithAuth from "../fetchWithAuth";
import config from '../../config';

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Déterminer si l'utilLateur est un chef de service en fonction de l'URL
  const isChefService = location.pathname.includes('/chef-service/');

  useEffect(() => {
    const loadPatient = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/');
        return;
      }
      
      try {
        const response = await fetchWithAuth(`http://${config.DjangoHost}:8000/api/patients/${id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 401) {
          throw new Error('401');
        }
        
        if (!response.ok) {
          throw new Error(`Erreur lors du chargement du patient. (Status: ${response.status})`);
        }
        
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        if (error.message === '401') {
          setError('Votre session a expiré. Veuillez vous reconnecter.');
          localStorage.removeItem('access_token');
          navigate('/');
        } else {
          setError('Erreur lors du chargement du patient.');
          // Rediriger vers le bon dashboard selon le rôle
          navigate(isChefService ? '/chef-service/patients' : '/dashboard/patients');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadPatient();
  }, [id, navigate, isChefService]);
    
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setError('Token manquant. Veuillez vous reconnecter.');
      navigate('/');
      return;
    }
    
    try {
      const patientData = {
        ...patient,
        date_naissance: patient.date_naissance?.split('T')[0] || ''
      };
      
      const response = await fetchWithAuth(`http://${config.DjangoHost}:8000/api/patients/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expiré ou invalide. (Status 401)');
        } else if (response.status === 403) {
          throw new Error("Vous n'avez pas la permission de modifier ce patient. (Status 403)");
        } else {
          throw new Error(`Erreur lors de la mise à jour du patient. (Status: ${response.status})`);
        }
      }
      
      alert('Patient modifié avec succès.');
      // Rediriger vers la bonne liste des patients selon le rôle
      navigate(isChefService ? '/chef-service/patients' : '/dashboard/patients');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      
      if (error.message.includes('401')) {
        setError('Session expirée ou non autorisée. Veuillez vous reconnecter.');
        localStorage.removeItem('access_token');
        navigate('/');
      } else if (error.message.includes('403')) {
        setError("Vous n'avez pas l'autorisation de modifier ce patient.");
      } else {
        setError(`Erreur: ${error.message}`);
      }
    }
  };
      
  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!patient) {
    return <div className="not-found-container">Patient non trouvé</div>;
  }

  return (
    <div className="edit-patient-container">
      <div className="edit-header">
        <h2>Modifier le patient</h2>
        <button 
          className="back-btn"
          onClick={() => navigate(isChefService ? '/chef-service/patients' : '/dashboard/patients')}
        >
          Retour à la liste
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="nom">Nom :</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={patient.nom || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="prenom">Prénom :</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={patient.prenom || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date_naissance">Date de naissance :</label>
          <input
            type="date"
            id="date_naissance"
            name="date_naissance"
            value={patient.date_naissance?.split('T')[0] || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={patient.email || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phonenumber">Téléphone :</label>
          <input
            type="tel"
            id="phonenumber"
            name="phonenumber"
            value={patient.phonenumber || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="adresse">Adresse :</label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            value={patient.adresse || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-btn">
            Enregistrer les modifications
          </button>
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={() => navigate(isChefService ? '/chef-service/patients' : '/dashboard/patients')}
          >
            Annuler
          </button>
        </div>
      </form>
       {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Traitement en cours...</div>
        </div>
      )}
    </div>
  );
}

export default EditPatient;