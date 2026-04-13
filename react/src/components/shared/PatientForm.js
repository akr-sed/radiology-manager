import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function PatientForm() {
  const navigate = useNavigate();
  const prefix = getRolePrefix();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const roles = userData.roles || [];
  const isRadiologue = roles.includes("radiologue");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    date_naissance: "",
    sexe: "M",
    phonenumber: "",
    adresse: "",
    radiologue_id: "",
  });
  const [radiologues, setRadiologues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isRadiologue) {
      fetchWithAuth(`${API_BASE}/api/radiologues/`, { method: "GET" })
        .then((res) => res.json())
        .then((data) => setRadiologues(data.radiologues || []))
        .catch(() => {});
    }
  }, [isRadiologue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isRadiologue && !formData.radiologue_id) {
      setError("Veuillez selectionner un radiologue.");
      setLoading(false);
      return;
    }

    try {
      const submitData = { ...formData };
      if (isRadiologue) delete submitData.radiologue_id;

      const response = await fetchWithAuth(`${API_BASE}/api/ajouterPatient`, {
        method: "POST",
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'ajout du patient");
      }

      alert("Patient ajoute avec succes.");
      navigate(`${prefix}/patients`);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Impossible d'ajouter le patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ajouter un Patient</h1>
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

          {!isRadiologue && (
            <div className="form-group">
              <label>Radiologue assign&eacute; *</label>
              <select
                name="radiologue_id"
                value={formData.radiologue_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Selectionner un radiologue --</option>
                {radiologues.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nom} {r.prenom}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
