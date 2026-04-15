import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import "../shared/Shared.css";

const EMPTY_FORM = { nom: "", nom_hopital: "", adresse: "", modalites: [], organes: [], ai_models: [] };

const MODALITY_OPTIONS = [
  { value: "xray", label: "Radiographie (X-Ray)" },
  { value: "irm", label: "IRM" },
  { value: "mammographie", label: "Mammographie" },
  { value: "echographie", label: "Echographie" },
  { value: "scanner", label: "Scanner (CT)" },
];

const ORGAN_OPTIONS = [
  { value: "thorax", label: "Thorax" },
  { value: "abdomen", label: "Abdomen" },
  { value: "cerveau", label: "Cerveau" },
  { value: "sein", label: "Sein" },
  { value: "os", label: "Os / Articulations" },
  { value: "coeur", label: "Coeur" },
  { value: "pelvis", label: "Pelvis" },
  { value: "colonne", label: "Colonne vertebrale" },
  { value: "autre", label: "Autre" },
];

const AI_MODEL_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "YOLOV11_ECO", label: "YOLOv11 - Echographie" },
  { value: "YOLOV11_IRM", label: "YOLOv11 - IRM" },
  { value: "YOLOV11_MAMO", label: "YOLOv11 - Mammographie" },
];

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth(`${API_BASE}/api/services`);
      const data = await res.json();
      if (data.status === "success") {
        setServices(data.services);
      } else {
        setError(data.message || "Erreur lors du chargement des services.");
      }
    } catch (err) {
      setError("Impossible de charger les services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({
      nom: service.nom || "",
      nom_hopital: service.nom_hopital || "",
      adresse: service.adresse || "",
      modalites: Array.isArray(service.modalites) ? service.modalites : [],
      organes: Array.isArray(service.organes) ? service.organes : [],
      ai_models: Array.isArray(service.ai_models) ? service.ai_models : [],
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

  const toggleMulti = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.modalites.length === 0) {
      alert("Veuillez sélectionner au moins une modalité.");
      return;
    }
    if (form.organes.length === 0) {
      alert("Veuillez sélectionner au moins un organe.");
      return;
    }
    try {
      if (editing) {
        const res = await fetchWithAuth(`${API_BASE}/api/modifierService`, {
          method: "POST",
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        const data = await res.json();
        if (data.status !== "success") {
          alert(data.message || "Erreur lors de la modification.");
          return;
        }
      } else {
        const res = await fetchWithAuth(`${API_BASE}/api/ajouterService`, {
          method: "POST",
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.status !== "success") {
          alert(data.message || "Erreur lors de l'ajout.");
          return;
        }
      }
      closeModal();
      loadServices();
    } catch {
      alert("Une erreur est survenue.");
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Supprimer le service "${service.nom}" ?`)) return;
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/supprimerService`, {
        method: "POST",
        body: JSON.stringify({ id: service.id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        loadServices();
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
        <p>Chargement des services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={loadServices}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Services</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Ajouter
        </button>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <p>Aucun service trouvé.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Hôpital</th>
              <th>Modalité</th>
              <th>Organe</th>
              <th>Modèle IA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.nom}</td>
                <td>{s.nom_hopital}</td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(s.modalites_display || []).map((m, i) => (
                      <span key={i} className="status-badge info">{m}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(s.organes_display || []).map((o, i) => (
                      <span key={i} className="status-badge">{o}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {((s.ai_models || []).filter(a => a !== "none")).length === 0 ? (
                      <span style={{ color: "#999" }}>Aucun</span>
                    ) : (
                      (s.ai_models_display || []).map((a, i) => (
                        s.ai_models[i] === "none" ? null : <span key={i} className="status-badge success">{a}</span>
                      ))
                    )}
                  </div>
                </td>
                <td>
                  <button
                    className="action-btn edit"
                    title="Modifier"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    title="Supprimer"
                    onClick={() => handleDelete(s)}
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
                {editing ? "Modifier le service" : "Ajouter un service"}
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
                <label>Nom de l'hôpital *</label>
                <input
                  name="nom_hopital"
                  value={form.nom_hopital}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Adresse *</label>
                <input
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Modalités * (plusieurs possibles)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                  {MODALITY_OPTIONS.map((o) => (
                    <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.modalites.includes(o.value)}
                        onChange={() => toggleMulti("modalites", o.value)}
                        style={{ width: "auto" }}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Organes * (plusieurs possibles)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                  {ORGAN_OPTIONS.map((o) => (
                    <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.organes.includes(o.value)}
                        onChange={() => toggleMulti("organes", o.value)}
                        style={{ width: "auto" }}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Modèles IA (plusieurs possibles)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                  {AI_MODEL_OPTIONS.filter(o => o.value !== "none").map((o) => (
                    <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.ai_models.includes(o.value)}
                        onChange={() => toggleMulti("ai_models", o.value)}
                        style={{ width: "auto" }}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
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
