import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import "./Shared.css";

function getRolePrefix() {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return "/admin";
  if (path.startsWith("/chef-service")) return "/chef-service";
  return "/dashboard";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function PatientList() {
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
      const response = await fetchWithAuth(`${API_BASE}/api/patients/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des patients");
      }
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger la liste des patients.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    return (
      patient.nom?.toLowerCase().includes(term) ||
      patient.prenom?.toLowerCase().includes(term) ||
      patient.email?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce patient ?")) return;
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/supprimerPatient/${id}/`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }
      alert("Patient supprime avec succes.");
      loadPatients();
    } catch (err) {
      console.error("Erreur:", err);
      alert("Impossible de supprimer le patient.");
    }
  };

  const prefix = getRolePrefix();
  const isAdmin = prefix === "/admin";

  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement des patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={loadPatients}>
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            className="search-bar"
            placeholder="Rechercher par nom, prenom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {!isAdmin && (
            <button
              className="btn-primary"
              onClick={() => navigate(`${prefix}/ajouter-patient`)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} />
              Ajouter Patient
            </button>
          )}
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="empty-state">
          <p>Aucun patient trouve.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prenom</th>
              <th>Email</th>
              <th>Date de naissance</th>
              <th>Telephone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.nom}</td>
                <td>{patient.prenom}</td>
                <td>{patient.email}</td>
                <td>{formatDate(patient.date_naissance)}</td>
                <td>{patient.phonenumber}</td>
                <td>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {!isAdmin && (
                      <button
                        className="action-btn view"
                        title="Voir"
                        onClick={() =>
                          navigate(`${prefix}/patient/${patient.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {!isAdmin && (
                      <>
                        <button
                          className="action-btn edit"
                          title="Modifier"
                          onClick={() =>
                            navigate(`${prefix}/modifier-patient/${patient.id}`)
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Supprimer"
                          onClick={() => handleDelete(patient.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
