import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaCheck, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AppointmentManagement.css";
import fetchWithAuth from "../fetchWithAuth";
import config from "../../config";

function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [isEditing, setIsEditing] = useState(false); // à toi de décider quand c’est true

  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    radiologue_id: "",
    date: "",
    lieu: "",
    type: "Examen (mammographie)",
    status: "Planifié",
    edit: "",
  });
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("user_role");
    let userId = localStorage.getItem("user_id");

    if (!userId) {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userId = user.id || user.user_id;
        } catch (parseError) {
          console.error("Erreur parsing user:", parseError);
        }
      }
    }

    if (userId) {
      setFormData((prev) => ({
        ...prev,
        radiologue_id: userId,
      }));
    }

    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      let url = `http://${config.DjangoHost}:8000/api/rdv_list/`;
      if (userId) {
        url = `http://${config.DjangoHost}:8000/api/rdv_list/?radiologue_id=${userId}`;
      }

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du chargement des rendez-vous"
        );
      }

      const data = await response.json();
      setAppointments(data.rdvs || []);
    } catch (error) {
      setError("Impossible de charger les rendez-vous: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");

      if (!token) {
        console.error("Token d'authentification manquant");
        return;
      }

      let url = `http://${config.DjangoHost}:8000/api/patients/?radiologue_id=${userId}`;

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          "Erreur lors du chargement des patients:",
          response.status
        );
        return;
      }

      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Token d'authentification manquant");
        return;
      }

      let radiologueId =
        formData.radiologue_id || localStorage.getItem("user_id");

      const dataToSend = {
        patient_id: parseInt(formData.patient_id),
        radiologue_id: parseInt(radiologueId),
        date: formData.date,
        lieu: formData.lieu,
        type: formData.type,
        status: formData.status,
        accepte: true,
      };

      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/ajouter_rdv/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout");
      }

      await loadAppointments();
      setShowAddForm(false);
      setFormData({
        patient_id: "",
        radiologue_id: radiologueId || "",
        date: "",
        lieu: "",
        type: "Examen (mammographie)",
        status: "Planifié",
      });
      alert("Rendez-vous ajouté avec succès !");
    } catch (error) {
      setError("Impossible d'ajouter le rendez-vous: " + error.message);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Token d'authentification manquant");
        return;
      }

      const dataToSend = {
        patient_id: parseInt(formData.patient_id),
        radiologue_id: parseInt(
          formData.radiologue_id || localStorage.getItem("user_id")
        ),
        date: formData.date,
        lieu: formData.lieu,
        type: formData.type,
        status: formData.status,
      };

      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/modifier_rdv/${editingAppointment}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la modification");
      }

      alert("Rendez-vous modifié avec succès");
      await loadAppointments();
      setShowAddForm(false);
      setEditingAppointment(null);
      resetForm();
    } catch (error) {
      setError("Impossible de modifier le rendez-vous: " + error.message);
    }
  };

  const resetForm = () => {
    let userId = localStorage.getItem("user_id");
    if (!userId) {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userId = user.id || user.user_id;
        } catch (parseError) {}
      }
    }

    setFormData({
      patient_id: "",
      radiologue_id: userId || "",
      date: "",
      lieu: "",
      type: "Examen (mammographie)",
      status: "Planifié",
    });
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingAppointment(null);
    setError(null);
    resetForm();
  };

  const handleEditAppointment = (rdv, edit) => {
    const date = new Date(rdv.date);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    setFormData({
      patient_id: rdv.patient.id.toString(),
      radiologue_id: rdv.radiologue.id.toString(),
      date: formattedDate,
      lieu: rdv.lieu,
      type: rdv.type,
      status: rdv.status,
      edit: edit,
    });

    setEditingAppointment(rdv.id);
    setShowAddForm(true);
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetchWithAuth(
          `http://${config.DjangoHost}:8000/api/supprimer_rdv/${id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erreur lors de la suppression");
        }

        alert("Rendez-vous supprimé");
        await loadAppointments();
      } catch (error) {
        setError("Impossible de supprimer: " + error.message);
      }
    }
  };

  const handleValidateAppointment = async (id) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/valider_rdv/${id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la validation");
      }

      alert("Rendez-vous validé");
      await loadAppointments();
    } catch (error) {
      setError("Impossible de valider: " + error.message);
    }
  };

  const filteredAppointments = appointments.filter((rdv) =>
    `${rdv.patient.nom} ${rdv.patient.prenom}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter((patient) =>
    `${patient.nom} ${patient.prenom}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Chargement...</div>;

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
              if (!showAddForm) {
                setShowAddForm(true);

                setEditingAppointment(null);
                resetForm();
              } else {
                cancelForm();
              }
            }}
          >
            {showAddForm || isEditing
              ? "Fermer le formulaire"
              : "Ajouter un rendez-vous"}
          </button>
        </div>
      </div>

      {error && <div>{error}</div>}
      <h2>Liste des rendez vous</h2>
      {showAddForm && (
        <div className="form-container">
          <form
            onSubmit={
              editingAppointment ? handleSubmitEdit : handleAddAppointment
            }
          >
            <h3>
              {isEditing === false
                ? "Consulter un rendez-vous"
                : "Modifier un rendez-vous"}
            </h3>

            <div className="form-group">
              <label>Patient</label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={
                  isEditing
                    ? undefined
                    : (e) =>
                        setFormData({ ...formData, patient_id: e.target.value })
                }
                required
              >
                {isEditing ? (
                  <>
                    {patients
                      .filter(
                        (p) =>
                          p.id.toString() === formData.patient_id.toString()
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom} {p.prenom}
                        </option>
                      ))}
                  </>
                ) : (
                  <>
                    {filteredPatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nom} {patient.prenom}
                      </option>
                    ))}
                  </>
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
                enable={isEditing ? true : false}
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
                enable={isEditing ? true : false}
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
                enable={isEditing ? true : false}
              >
                {isEditing ? (
                  <>
                    {" "}
                    <option value="Examen (mammographie)">
                      Objectif du rendez vous
                    </option>
                    <option value="Consultation">Consultation</option>
                    <option value="Suivi">Suivi</option>
                    <option value="Autre">Autre</option>):
                  </>
                ) : (
                  <option value={formData.type}>{formData.type}</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                required
                enable={isEditing ? true : false}
              >
                {isEditing ? (
                  <>
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Annulé">Annulé</option>
                  </>
                ) : (
                  <option value={formData.status}>{formData.status}</option>
                )}
              </select>
            </div>

            <div className="form-buttons">
              {isEditing ? (
                <>
                  <button type="submit">
                    {editingAppointment ? "Mettre à jour" : "Enregistrer"}
                  </button>
                </>
              ) : null}
              <button type="button" onClick={cancelForm}>
                {!isEditing ? "Fermer" : "Annuler"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showAddForm && (
        <div className="appointments-table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
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
                  <td colSpan="7">Aucun rendez-vous trouvé</td>
                </tr>
              ) : (
                filteredAppointments.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>
                      {rdv.patient.nom} {rdv.patient.prenom}
                    </td>
                    <td>{new Date(rdv.date).toLocaleString()}</td>
                    <td>{rdv.lieu}</td>
                    <td>{rdv.type}</td>
                    <td>{rdv.status}</td>
                    <td>
                      {rdv.accepte ? (
                        "Validé"
                      ) : (
                        <button
                          onClick={() => handleValidateAppointment(rdv.id)}
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        onClick={() => {
                          setIsEditing(false);
                          handleEditAppointment(rdv);
                        }}
                        title="Voir"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setIsEditing(true);
                          handleEditAppointment(rdv);
                        }}
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

export default AppointmentManagement;
