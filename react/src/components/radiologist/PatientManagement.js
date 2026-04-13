import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientManagement.css";
import fetchWithAuth from "../fetchWithAuth";
import config from "../../config";

import { FaTrash, FaEye, FaEdit } from "react-icons/fa";

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");

      // Utiliser la méthode GET au lieu de POST pour récupérer des données
      // L'API doit être configurée pour ne renvoyer que les patients du radiologue connecté
      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/patients/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur de connexion");
      }

      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        "Impossible de charger la liste des patients. Veuillez réessayer plus tard."
      );
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.nom?.toLowerCase().includes(searchLower) ||
      patient.prenom?.toLowerCase().includes(searchLower) ||
      patient.phonenumber?.includes(searchTerm)
    );
  });

  const handleViewPatient = (patientId) => {
    const basePath = window.location.pathname.includes("/chef-service")
      ? "/chef-service/patient"
      : "/dashboard/patient";
    navigate(`${basePath}/${patientId}`);
  };

  const handleEditPatient = (patientId) => {
    const basePath = window.location.pathname.includes("/chef-service")
      ? "/chef-service/modifier-patient"
      : "/dashboard/modifier-patient";
    navigate(`${basePath}/${patientId}`);
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm("Confirmer la suppression ?")) {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetchWithAuth(
          `http://${config.DjangoHost}:8000/api/supprimerPatient/${patientId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du patient.");
        }

        alert("Patient supprimé avec succès.");
        loadPatients(); // Recharge la liste des patients
      } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de supprimer le patient.");
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="patient-management-container">
      <div className="header">
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="add-patient-btn"
            onClick={() => {
              const path = window.location.pathname.includes("/chef-service")
                ? "/chef-service/ajouter-patient"
                : "/dashboard/ajouter-patient";
              navigate(path);
            }}
          >
            Ajouter un patient
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadPatients} className="retry-btn">
            Réessayer
          </button>
        </div>
      )}
      <h2>Liste des patients</h2>
      <div className="patients-table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Date de naissance</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Adresse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 && !loading && !error ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Aucun patient trouvé
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.nom}</td>
                  <td>{patient.prenom}</td>
                  <td>
                    {new Date(patient.date_naissance).toLocaleDateString()}
                  </td>
                  <td>{patient.phonenumber}</td>
                  <td>{patient.email}</td>
                  <td>{patient.adresse}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewPatient(patient.id)}
                      title="Voir"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditPatient(patient.id)}
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeletePatient(patient.id)}
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
    </div>
  );
}

export default PatientManagement;
