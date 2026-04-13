import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import "./Shared.css";

function getRolePrefix() {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return "/admin";
  if (path.startsWith("/chef-service")) return "/chef-service";
  return "/dashboard";
}

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const prefix = getRolePrefix();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    date_naissance: "",
    sexe: "M",
    phonenumber: "",
    adresse: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/patient/${id}/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du patient");
      }
      const data = await response.json();
      setFormData({
        nom: data.nom || "",
        prenom: data.prenom || "",
        email: data.email || "",
        date_naissance: data.date_naissance || "",
        sexe: data.sexe || "M",
        phonenumber: data.phonenumber || "",
        adresse: data.adresse || "",
      });
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les informations du patient.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_BASE}/api/patient/${id}/`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la modification");
      }

      alert("Patient modifie avec succes.");
      navigate(`${prefix}/patients`);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Impossible de modifier le patient.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations du patient...</p>
      </div>
    );
  }

  if (error && !formData.nom) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={loadPatient}>
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Modifier le Patient</h1>
        <button
          className="btn-secondary"
          onClick={() => navigate(`${prefix}/patients`)}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Prenom *</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de naissance *</label>
            <input
              type="date"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Sexe *</label>
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              required
            >
              <option value="M">Masculin</option>
              <option value="F">Feminin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Telephone</label>
            <input
              type="text"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <textarea
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`${prefix}/patients`)}
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Modification en cours..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
