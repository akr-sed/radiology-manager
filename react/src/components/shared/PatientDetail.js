import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import ImageUpload from "./ImageUpload";
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

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const prefix = getRolePrefix();

  const [patient, setPatient] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setPatient(data);

      // Load medical images
      loadImages();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les informations du patient.");
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/patient/listimages/`,
        {
          method: "POST",
          body: JSON.stringify({ patient_id: id }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des images:", err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations du patient...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={loadPatient}>
          Reessayer
        </button>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Details du Patient</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn-primary"
            onClick={() => navigate(`${prefix}/modifier-patient/${id}`)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Pencil size={16} />
            Modifier
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate(`${prefix}/patients`)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>
      </div>

      {/* Patient Info Card */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#1a1a2e" }}>
          Informations personnelles
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <InfoItem icon={<User size={16} />} label="Nom" value={patient.nom} />
          <InfoItem icon={<User size={16} />} label="Prenom" value={patient.prenom} />
          <InfoItem icon={<Mail size={16} />} label="Email" value={patient.email} />
          <InfoItem
            icon={<Calendar size={16} />}
            label="Date de naissance"
            value={formatDate(patient.date_naissance)}
          />
          <InfoItem icon={<User size={16} />} label="Sexe" value={patient.sexe === "M" ? "Masculin" : "Feminin"} />
          <InfoItem icon={<Phone size={16} />} label="Telephone" value={patient.phonenumber || "Non renseigne"} />
          <InfoItem icon={<MapPin size={16} />} label="Adresse" value={patient.adresse || "Non renseignee"} />
        </div>
      </div>

      {/* Medical Images Section */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#1a1a2e" }}>
          Images medicales
        </h2>
        {images.length === 0 ? (
          <div className="empty-state">
            <p>Aucune image medicale.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {images.map((image, index) => (
              <div
                key={image.id || index}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={image.image_url || image.url || `${API_BASE}${image.image}`}
                  alt={image.titre || `Image ${index + 1}`}
                  style={{ width: "100%", height: "160px", objectFit: "cover" }}
                />
                {image.titre && (
                  <div style={{ padding: "8px 12px", fontSize: "13px", color: "#333" }}>
                    {image.titre}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Upload Section */}
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#1a1a2e" }}>
            Ajouter une image
          </h3>
          <ImageUpload patientId={id} onUploadSuccess={loadImages} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <div style={{ color: "#0091FF", marginTop: "2px" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "12px", color: "#999", fontWeight: 600, marginBottom: "2px" }}>
          {label}
        </div>
        <div style={{ fontSize: "14px", color: "#333" }}>{value}</div>
      </div>
    </div>
  );
}
