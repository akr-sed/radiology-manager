import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Calendar } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import "./Shared.css";

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getUserRoles() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.roles || [];
  } catch {
    return [];
  }
}

function getStatusBadgeClass(statut) {
  if (!statut) return "status-badge info";
  const s = statut.toLowerCase();
  if (s === "confirmé" || s === "confirme") return "status-badge success";
  if (s === "rejeté" || s === "rejete" || s === "refusé" || s === "refuse")
    return "status-badge danger";
  return "status-badge info";
}

const TYPE_OPTIONS = [
  "Examen (mammographie)",
  "Examen (échographie)",
  "Examen (IRM)",
  "Consultation",
];

export default function AppointmentManagement() {
  const [rdvs, setRdvs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [radiologues, setRadiologues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingRdv, setEditingRdv] = useState(null);
  const [form, setForm] = useState({
    patient_id: "",
    radiologue_id: "",
    date: "",
    lieu: "",
    type: TYPE_OPTIONS[0],
  });

  const roles = getUserRoles();
  const isRadiologue = roles.includes("radiologue");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rdvRes, patientRes, radiologueRes] = await Promise.all([
        fetchWithAuth(`${API_BASE}/api/rdv_list/`, { method: "GET" }),
        fetchWithAuth(`${API_BASE}/api/patients/`, { method: "GET" }),
        fetchWithAuth(`${API_BASE}/api/radiologues/`, { method: "GET" }),
      ]);

      if (!rdvRes.ok) throw new Error("Erreur lors du chargement des RDVs");
      if (!patientRes.ok)
        throw new Error("Erreur lors du chargement des patients");
      if (!radiologueRes.ok)
        throw new Error("Erreur lors du chargement des radiologues");

      const rdvData = await rdvRes.json();
      const patientData = await patientRes.json();
      const radiologueData = await radiologueRes.json();

      setRdvs(rdvData.rdvs || []);
      setPatients(patientData.patients || []);
      setRadiologues(radiologueData.radiologues || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRdv(null);
    setForm({
      patient_id: "",
      radiologue_id: "",
      date: "",
      lieu: "",
      type: TYPE_OPTIONS[0],
    });
    setShowModal(true);
  };

  const openEditModal = (rdv) => {
    setEditingRdv(rdv);
    let dateValue = "";
    if (rdv.date) {
      const d = new Date(rdv.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    setForm({
      patient_id: rdv.patient_id || rdv.patient?.id || "",
      radiologue_id: rdv.radiologue_id || rdv.radiologue?.id || "",
      date: dateValue,
      lieu: rdv.lieu || "",
      type: rdv.type || TYPE_OPTIONS[0],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRdv(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        patient_id: form.patient_id,
        radiologue_id: form.radiologue_id,
        date: form.date,
        lieu: form.lieu,
        type: form.type,
      };

      let response;
      if (editingRdv) {
        response = await fetchWithAuth(
          `${API_BASE}/api/modifier_rdv/${editingRdv.id}/`,
          {
            method: "PUT",
            body: JSON.stringify(body),
          }
        );
      } else {
        response = await fetchWithAuth(`${API_BASE}/api/ajouter_rdv/`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde du RDV");
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error("Erreur:", err);
      alert(err.message || "Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce rendez-vous ?")) return;
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/supprimer_rdv/${id}/`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }
      loadData();
    } catch (err) {
      console.error("Erreur:", err);
      alert("Impossible de supprimer le rendez-vous.");
    }
  };

  const handleRespond = async (id, accepte) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/repondre_rdv/${id}/`,
        {
          method: "POST",
          body: JSON.stringify({ accepte }),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la réponse au RDV");
      }
      loadData();
    } catch (err) {
      console.error("Erreur:", err);
      alert("Impossible de répondre au rendez-vous.");
    }
  };

  const getPatientName = (rdv) => {
    if (rdv.patient_nom && rdv.patient_prenom) {
      return `${rdv.patient_nom} ${rdv.patient_prenom}`;
    }
    if (rdv.patient) {
      return `${rdv.patient.nom || ""} ${rdv.patient.prenom || ""}`.trim();
    }
    const patient = patients.find(
      (p) => p.id === (rdv.patient_id || rdv.patient?.id)
    );
    return patient ? `${patient.nom} ${patient.prenom}` : "";
  };

  const getRadiologueName = (rdv) => {
    if (rdv.radiologue_nom && rdv.radiologue_prenom) {
      return `${rdv.radiologue_nom} ${rdv.radiologue_prenom}`;
    }
    if (rdv.radiologue) {
      return `${rdv.radiologue.nom || ""} ${rdv.radiologue.prenom || ""}`.trim();
    }
    const rad = radiologues.find(
      (r) => r.id === (rdv.radiologue_id || rdv.radiologue?.id)
    );
    return rad ? `${rad.nom} ${rad.prenom}` : "";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement des rendez-vous...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={loadData}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Rendez-vous</h1>
        <button
          className="btn-primary"
          onClick={openAddModal}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          Nouveau RDV
        </button>
      </div>

      {rdvs.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p>Aucun rendez-vous trouvé.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Radiologue</th>
              <th>Type</th>
              <th>Lieu</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rdvs.map((rdv) => (
              <tr key={rdv.id}>
                <td>{formatDateTime(rdv.date)}</td>
                <td>{getPatientName(rdv)}</td>
                <td>{getRadiologueName(rdv)}</td>
                <td>{rdv.type}</td>
                <td>{rdv.lieu}</td>
                <td>
                  <span className={getStatusBadgeClass(rdv.statut)}>
                    {rdv.statut || "Planifié"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      className="action-btn edit"
                      title="Modifier"
                      onClick={() => openEditModal(rdv)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      title="Supprimer"
                      onClick={() => handleDelete(rdv.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                    {isRadiologue &&
                      (rdv.statut === "Planifié" || rdv.statut === "Planifie") && (
                        <>
                          <button
                            className="action-btn"
                            title="Accepter"
                            style={{ color: "#22C55E" }}
                            onClick={() => handleRespond(rdv.id, true)}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="action-btn"
                            title="Rejeter"
                            style={{ color: "#EF4444" }}
                            onClick={() => handleRespond(rdv.id, false)}
                          >
                            <X size={16} />
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">
              {editingRdv ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient</label>
                <select
                  name="patient_id"
                  value={form.patient_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} {p.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Radiologue</label>
                <select
                  name="radiologue_id"
                  value={form.radiologue_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">-- Sélectionner un radiologue --</option>
                  {radiologues.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nom} {r.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lieu</label>
                <input
                  type="text"
                  name="lieu"
                  value={form.lieu}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  required
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingRdv ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
