import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./../radiologist/AppointmentManagement.css";
import fetchWithAuth from "../fetchWithAuth";
import config from "../../config";

function EditAppointmentChef() {
  const { id } = useParams();
  const isEdit = true; // Ce composant est toujours en mode édition
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    radiologue_id: "",
    date: "",
    lieu: "",
    type: "Examen (mammographie)",
    status: "Planifié",
    accepte: false,
    isEdit: "",
  });
  const [patients, setPatients] = useState([]);
  const [radiologues, setRadiologues] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const chefId = localStorage.getItem("user_id");

  useEffect(() => {
    loadAppointmentDetails();
    loadPatients();
    loadRadiologues();
  }, [id]);

  const loadAppointmentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/detail_rdv/${id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des détails du rendez-vous");

      const data = await response.json();
      const rdv = data.rdv;

      if (rdv) {
        // Formater la date pour l'input datetime-local
        const date = new Date(rdv.date);
        const formattedDate = date.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM

        setFormData({
          patient_id: rdv.patient.id,
          radiologue_id: rdv.radiologue.id,
          date: formattedDate,
          lieu: rdv.lieu,
          type: rdv.type,
          status: rdv.status,
          accepte: rdv.accepte,
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de charger les détails du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/patients/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Erreur de connexion");
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const loadRadiologues = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/radiologues/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Erreur de connexion");
      const data = await response.json();
      setRadiologues(data.radiologues || []);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    if (!formData.radiologue_id) {
      setError("Veuillez sélectionner un radiologue.");
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const requestData = {
        ...formData,
        chef_id: chefId,
      };

      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/modifier_rdv/${id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la modification");

      // Rediriger vers la page de gestion des rendez-vous après la mise à jour
      navigate("/chef-service/rendez-vous");
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de modifier le rendez-vous.");
    }
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.nom} ${patient.prenom}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="edit-appointment-container">
      <div className="header">
        <h2>Modifier le Rendez-vous</h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadAppointmentDetails} className="retry-btn">
            Réessayer
          </button>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleUpdateAppointment} className="appointment-form">
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
              onChange={(e) =>
                setFormData({ ...formData, patient_id: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, radiologue_id: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Lieu</label>
            <input
              type="text"
              name="lieu"
              value={formData.lieu}
              onChange={(e) =>
                setFormData({ ...formData, lieu: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, accepte: e.target.value === "true" })
              }
            >
              <option value="false">En attente</option>
              <option value="true">Validé</option>
            </select>
          </div>
          <div className="form-buttons">
            <button type="submit" className="save-button">
              Mettre à jour
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/chef-service/rendez-vous")}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAppointmentChef;
