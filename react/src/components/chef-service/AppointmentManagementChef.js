import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import './../radiologist/AppointmentManagement.css';
import fetchWithAuth from "../fetchWithAuth";
import config from '../../config';

function AppointmentManagementChef() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    radiologue_id: '',
    date: '',
    lieu: '',
    type: 'Examen (mammographie)',
    status: 'Planifié',
    accepte: false, // Par défaut, non validé
  });
  const [patients, setPatients] = useState([]);
  const [radiologues, setRadiologues] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const chefId = localStorage.getItem('user_id');

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadRadiologues();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      // Récupérer uniquement les RDV du chef de service
      const response = await fetchWithAuth(`http://`+config.DjangoHost+`:8000/api/rdv_list/?chef_id=${chefId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur de connexion');
      const data = await response.json();
      setAppointments(data.rdvs || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetchWithAuth(`http://${config.DjangoHost}:8000/api/patients/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur de connexion');
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadRadiologues = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetchWithAuth(`http://${config.DjangoHost}/api/radiologues/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur de connexion');
      const data = await response.json();
      setRadiologues(data.radiologues || []);
      if (data.radiologues && data.radiologues.length > 0) {
        setFormData((prev) => ({ ...prev, radiologue_id: data.radiologues[0].id }));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    if (!formData.radiologue_id) {
      setError('Veuillez sélectionner un radiologue.');
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const requestData = {
        ...formData,
        chef_id: chefId, // Ajouter l'ID du chef de service
      };
      
      const response = await fetchWithAuth(`http://${config.DjangoHost}:8000/api/ajouter_rdv/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');
      await loadAppointments();
      setShowAddForm(false);
      resetForm();
      setPatientSearch('');
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible d\'ajouter le rendez-vous.');
    }
  };

  // Fonction corrigée pour le bouton "Modifier"
  const handleEditAppointment = async (rdvId) => {
    try {
      setLoading(true);
      // Au lieu de faire une requête supplémentaire, utilisons les données que nous avons déjà
      const appointmentToEdit = appointments.find(rdv => rdv.id === rdvId);
      
      if (appointmentToEdit) {
        // Définir d'abord editingAppointment et showAddForm
        setEditingAppointment(rdvId);
        setShowAddForm(true);
        
        // Formater la date pour l'input datetime-local
        const date = new Date(appointmentToEdit.date);
        const formattedDate = date.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
        
        // Puis définir formData et patientSearch
        setFormData({
          patient_id: appointmentToEdit.patient.id,
          radiologue_id: appointmentToEdit.radiologue.id,
          date: formattedDate,
          lieu: appointmentToEdit.lieu,
          type: appointmentToEdit.type,
          status: appointmentToEdit.status,
          accepte: appointmentToEdit.accepte,
        });
        
        setPatientSearch(`${appointmentToEdit.patient.nom} ${appointmentToEdit.patient.prenom}`);
      } else {
        throw new Error('Rendez-vous non trouvé');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les détails du rendez-vous.');
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    if (!formData.radiologue_id) {
      setError('Veuillez sélectionner un radiologue.');
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const requestData = {
        ...formData,
        chef_id: chefId,
      };
      
      const response = await fetchWithAuth(`http://`+config.DjangoHost+`:8000/api/modifier_rdv/${editingAppointment}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Erreur lors de la modification');
      await loadAppointments();
      setShowAddForm(false);
      setEditingAppointment(null);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de modifier le rendez-vous.');
    }
  };

  const handleDeleteAppointment = async (rdvId) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetchWithAuth(`http://`+config.DjangoHost+`:8000/api/supprimer_rdv/${rdvId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');
        await loadAppointments();
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de supprimer le rendez-vous.');
      }
    }
  };

  const handleValidateAppointment = async (rdvId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetchWithAuth(`http://`+config.DjangoHost+`:8000/api/valider_rdv/${rdvId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la validation');
      await loadAppointments();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de valider le rendez-vous.');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      radiologue_id: radiologues.length > 0 ? radiologues[0].id : '',
      date: '',
      lieu: '',
      type: 'Examen (mammographie)',
      status: 'Planifié',
      accepte: false,
    });
    setPatientSearch('');
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingAppointment(null);
    resetForm();
  };

  const filteredAppointments = appointments.filter((rdv) =>
    `${rdv.patient.nom} ${rdv.patient.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter((patient) =>
    `${patient.nom} ${patient.prenom}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="appointment-management-container">
      <div className="header">
        <h2>Gestion des Rendez-vous</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Rechercher par nom du patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={() => {
              if (!showAddForm) {
                setShowAddForm(true);
                setEditingAppointment(null);
                resetForm();
              } else {
                cancelForm();
              }
            }}
            className="add-appointment-btn"
          >
            {showAddForm ? 'Fermer le formulaire' : 'Ajouter un rendez-vous'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadAppointments} className="retry-btn">Réessayer</button>
        </div>
      )}

      {showAddForm && (
        <div className="form-container">
          <form onSubmit={editingAppointment ? handleUpdateAppointment : handleAddAppointment} className="appointment-form">
            <h3>{editingAppointment ? 'Modifier le rendez-vous' : 'Ajouter un rendez-vous'}</h3>
            <div className="form-group">
              <label>Rechercher un patient</label>
              <input
                type="text"
                placeholder="Nom du patient..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                required
              >
                <option value="">Sélectionner un patient</option>
                {filteredPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nom} {patient.prenom}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Radiologue</label>
              <select
                name="radiologue_id"
                value={formData.radiologue_id}
                onChange={(e) => setFormData({ ...formData, radiologue_id: e.target.value })}
                required
              >
                {radiologues.length === 0 ? (
                  <option value="">Aucun radiologue disponible</option>
                ) : (
                  radiologues.map((radiologue) => (
                    <option key={radiologue.id} value={radiologue.id}>
                      {radiologue.nom} {radiologue.prenom}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Lieu</label>
              <input
                type="text"
                name="lieu"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            {editingAppointment && (
              <>
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Validation</label>
                  <select
                    name="accepte"
                    value={formData.accepte}
                    onChange={(e) => setFormData({ ...formData, accepte: e.target.value === 'true' })}
                  >
                    <option value="false">En attente</option>
                    <option value="true">Validé</option>
                  </select>
                </div>
              </>
            )}
            <div className="form-buttons">
              <button type="submit" className="save-button">
                {editingAppointment ? 'Mettre à jour' : 'Enregistrer'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={cancelForm}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {!showAddForm && (
        <div className="appointments-table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Radiologue</th>
                <th>Date</th>
                <th>Lieu</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Validé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">Aucun rendez-vous trouvé</td>
                </tr>
              ) : (
                filteredAppointments.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{rdv.patient.nom} {rdv.patient.prenom}</td>
                    <td>{rdv.radiologue.nom} {rdv.radiologue.prenom}</td>
                    <td>{new Date(rdv.date).toLocaleString()}</td>
                    <td>{rdv.lieu}</td>
                    <td>{rdv.type}</td>
                    <td>{rdv.status}</td>
                    <td>
                      {rdv.accepte ? 'Validé' : (
                        <button
                          className="action-btn validate-btn"
                          onClick={() => handleValidateAppointment(rdv.id)}
                          title="Valider"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditAppointment(rdv.id)}
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteAppointment(rdv.id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AppointmentManagementChef;