import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import "../shared/Shared.css";

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  phonenumber: "",
  adresse: "",
  date_naissance: "",
};

export default function ChefServiceManagement() {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadChefs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth(`${API_BASE}/api/ChefService`);
      const data = await res.json();
      if (data.status === "success") {
        setChefs(data.chefs_service);
      } else {
        setError(data.message || "Erreur lors du chargement.");
      }
    } catch (err) {
      setError("Impossible de charger les chefs de service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChefs();
  }, [loadChefs]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (chef) => {
    setEditing(chef);
    setForm({
      nom: chef.nom || "",
      prenom: chef.prenom || "",
      email: chef.email || "",
      password: "",
      phonenumber: chef.phonenumber || "",
      adresse: chef.adresse || "",
      date_naissance: chef.date_naissance || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        phonenumber: form.phonenumber,
        adresse: form.adresse,
        date_naissance: form.date_naissance,
        roles: ["chef_service"],
      };

      if (editing) {
        payload.id = editing.id;
        if (form.password) {
          payload.password = form.password;
        }
        const res = await fetchWithAuth(`${API_BASE}/api/modifierChefService`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.status !== "success") {
          alert(data.message || "Erreur lors de la modification.");
          return;
        }
      } else {
        payload.password = form.password;
        const res = await fetchWithAuth(`${API_BASE}/api/ajouterChefService`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.status !== "success") {
          alert(data.message || "Erreur lors de l'ajout.");
          return;
        }
      }
      closeModal();
      loadChefs();
    } catch {
      alert("Une erreur est survenue.");
    }
  };

  const handleDelete = async (chef) => {
    if (!window.confirm(`Supprimer le chef de service "${chef.nom} ${chef.prenom}" ?`)) return;
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/supprimerChefService`, {
        method: "POST",
        body: JSON.stringify({ id: chef.id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        loadChefs();
      } else {
        alert(data.message || "Erreur lors de la suppression.");
      }
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement des chefs de service...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={loadChefs}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Chefs de Service</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Ajouter
        </button>
      </div>

      {chefs.length === 0 ? (
        <div className="empty-state">
          <p>Aucun chef de service trouvé.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chefs.map((c) => (
              <tr key={c.id}>
                <td>{c.nom}</td>
                <td>{c.prenom}</td>
                <td>{c.email}</td>
                <td>{c.phonenumber}</td>
                <td>
                  <button
                    className="action-btn edit"
                    title="Modifier"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    title="Supprimer"
                    onClick={() => handleDelete(c)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="modal-title">
                {editing ? "Modifier le chef de service" : "Ajouter un chef de service"}
              </h2>
              <button className="action-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Mot de passe {editing ? "(laisser vide pour ne pas changer)" : "*"}
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editing}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  name="phonenumber"
                  value={form.phonenumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Date de naissance</label>
                <input
                  name="date_naissance"
                  type="date"
                  value={form.date_naissance}
                  onChange={handleChange}
                />
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
                  {editing ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
