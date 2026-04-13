import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewPatient.css";
import fetchWithAuth from "../fetchWithAuth";
import config from "../../config";
function NewPatient() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    numeroSecu: "",
    telephone: "",
    email: "",
    adresse: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !patient.nom ||
      !patient.prenom ||
      !patient.dateNaissance ||
      !patient.numeroSecu ||
      !patient.telephone
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem("access_token");
      const radiologueId = localStorage.getItem("radiologue_id") || 1;
      const response = await fetchWithAuth(
        "http://" + config.DjangoHost + ":8000/api/ajouterPatient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            nom: patient.nom,
            prenom: patient.prenom,
            date_naissance: patient.dateNaissance,
            numero_secu: patient.numeroSecu,
            telephone: patient.telephone,
            email: patient.email || `${patient.numeroSecu}@patient.com`,
            adresse: patient.adresse || "Non spécifiée",
            radiologue_id: radiologueId,
          }),
        }
      );

      if (response.ok) {
        alert("Patient ajouté avec succès");
        setPatient({
          nom: "",
          prenom: "",
          dateNaissance: "",
          numeroSecu: "",
          telephone: "",
          email: "",
          adresse: "",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error(error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="account-container">
      <h2>Ajouter un nouveau patient</h2>
      <div className="account-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              name="nom"
              value={patient.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Prénom *</label>
            <input
              type="text"
              name="prenom"
              value={patient.prenom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de naissance *</label>
            <input
              type="date"
              name="dateNaissance"
              value={patient.dateNaissance}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Numéro de sécurité sociale *</label>
            <input
              type="text"
              name="numeroSecu"
              value={patient.numeroSecu}
              onChange={handleChange}
              required
              pattern="[0-9]{15}"
              title="15 chiffres requis"
            />
          </div>

          <div className="form-group">
            <label>Téléphone *</label>
            <input
              type="tel"
              name="telephone"
              value={patient.telephone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={patient.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <textarea
              name="adresse"
              value={patient.adresse}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Enregistrement en cours..."
                : "Enregistrer le patient"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPatient;
