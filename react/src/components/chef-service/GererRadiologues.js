import React, { useState, useEffect } from "react";
import { Search, Plus, Eye, Pencil, Trash2, X } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import "../shared/Shared.css";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

const emptyForm = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  phonenumber: "",
  adresse: "",
  date_naissance: "",
  roles: ["RADIOLOGUE"],
};

export default function GererRadiologues() {
  const [radiologues, setRadiologues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRadiologues();
  }, []);

  const fetchRadiologues = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/radiologues/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des radiologues");
      }
      const data = await response.json();
      setRadiologues(data.radiologues || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger la liste des radiologues.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRadiologues = radiologues.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.nom?.toLowerCase().includes(term) ||
      r.prenom?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term)
    );
  });

  const openAddModal = () => {
    setFormData({ ...emptyForm });
    setEditMode(false);
    setSelectedId(null);
    setShowModal(true);
  };

  const openEditModal = (radiologue) => {
    if (!radiologue || !radiologue.id) {
      alert("Impossible de modifier : ID du radiologue manquant");
      return;
    }

    let formattedDate = "";
    if (radiologue.date_naissance) {
      try {
        const date = new Date(radiologue.date_naissance);
        formattedDate = date.toISOString().split("T")[0];
      } catch {
        formattedDate = "";
      }
    }

    setFormData({
      nom: radiologue.nom || "",
      prenom: radiologue.prenom || "",
      email: radiologue.email || "",
      password: "",
      phonenumber: radiologue.phonenumber || "",
      adresse: radiologue.adresse || "",
      date_naissance: formattedDate,
      roles: radiologue.roles || ["RADIOLOGUE"],
    });
    setSelectedId(radiologue.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.nom || !formData.prenom || !formData.email) {
      alert("Veuillez remplir tous les champs obligatoires (nom, prenom, email).");
      return;
    }
    if (!editMode && !formData.password) {
      alert("Le mot de passe est obligatoire pour un nouveau radiologue.");
      return;
    }

    setSubmitting(true);
    try {
      let roles = Array.isArray(formData.roles)
        ? [...formData.roles]
        : ["RADIOLOGUE"];
      if (!roles.some((r) => r.toUpperCase() === "RADIOLOGUE")) {
        roles.push("RADIOLOGUE");
      }

      const body = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        phonenumber: formData.phonenumber || null,
        adresse: formData.adresse || null,
        date_naissance: formData.date_naissance || null,
        roles,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const url = editMode
        ? `${API_BASE}/api/modifierRadiologue/${selectedId}/`
        : `${API_BASE}/api/ajouterRadiologue/`;
      const method = editMode ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      alert(
        result.message ||
          (editMode
            ? "Radiologue modifie avec succes"
            : "Radiologue ajoute avec succes")
      );
      setShowModal(false);
      fetchRadiologues();
    } catch (err) {
      console.error("Erreur:", err);
      alert(err.message || "Une erreur s'est produite.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Etes-vous sur de vouloir supprimer ce radiologue ?")) {
      return;
    }
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/supprimer_radiologue/${id}/`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      alert(result.message || "Radiologue supprime avec succes");
      fetchRadiologues();
    } catch (err) {
      console.error("Erreur:", err);
      alert(err.message || "Impossible de supprimer le radiologue.");
    }
  };

  const handleView = (radiologue) => {
    window.alert(
      `Details du radiologue:\n` +
        `Nom: ${radiologue.nom}\n` +
        `Prenom: ${radiologue.prenom}\n` +
        `Email: ${radiologue.email}\n` +
        `Telephone: ${radiologue.phonenumber || "-"}\n` +
        `Adresse: ${radiologue.adresse || "-"}\n` +
        `Date de naissance: ${formatDate(radiologue.date_naissance)}`
    );
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement des radiologues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={fetchRadiologues}>
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gerer les Radiologues</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
              }}
            />
            <input
              type="text"
              className="search-bar"
              placeholder="Rechercher par nom, prenom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
          <button
            className="btn-primary"
            onClick={openAddModal}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {filteredRadiologues.length === 0 ? (
        <div className="empty-state">
          <p>Aucun radiologue trouve.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prenom</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Date de naissance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRadiologues.map((radiologue) => (
              <tr key={radiologue.id}>
                <td>{radiologue.nom}</td>
                <td>{radiologue.prenom}</td>
                <td>{radiologue.email}</td>
                <td>{radiologue.phonenumber || "-"}</td>
                <td>{formatDate(radiologue.date_naissance)}</td>
                <td>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      className="action-btn view"
                      title="Voir"
                      onClick={() => handleView(radiologue)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn edit"
                      title="Modifier"
                      onClick={() => openEditModal(radiologue)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      title="Supprimer"
                      onClick={() => handleDelete(radiologue.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2 className="modal-title" style={{ margin: 0 }}>
                {editMode ? "Modifier le Radiologue" : "Ajouter un Radiologue"}
              </h2>
              <button
                className="action-btn"
                onClick={() => setShowModal(false)}
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => updateField("nom", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Prenom *</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => updateField("prenom", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                {editMode
                  ? "Nouveau mot de passe (laisser vide pour ne pas changer)"
                  : "Mot de passe *"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required={!editMode}
              />
            </div>

            <div className="form-group">
              <label>Telephone</label>
              <input
                type="text"
                value={formData.phonenumber}
                onChange={(e) => updateField("phonenumber", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Adresse</label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => updateField("adresse", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Date de naissance</label>
              <input
                type="date"
                value={formData.date_naissance}
                onChange={(e) => updateField("date_naissance", e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Traitement..."
                  : editMode
                  ? "Modifier"
                  : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
