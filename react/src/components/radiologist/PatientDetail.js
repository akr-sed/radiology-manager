import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./PatientDetail.css";
import AddImage from "./AddImage";
import ImageGallery from "./ImageGallery";
import mammoIcon from "./icons/mammo-icon.png";
import echoIcon from "./icons/echo-icon.png";
import irmIcon from "./icons/irm-icon.png";
import fetchWithAuth from "../fetchWithAuth";
import config from "../../config";

function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [showAddImage, setShowAddImage] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [images, setImages] = useState({
    mammographie: [],
    irm: [],
    echographie: [],
  });

  // Fonction pour charger patient + images
  const fetchData = async () => {
    try {
      const responsePatient = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/patient/${id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!responsePatient.ok) {
        throw new Error("Erreur lors du chargement du patient");
      }

      const patientData = await responsePatient.json();

      const responseImages = await fetchWithAuth(
        `http://${config.DjangoHost}:8000/api/patient/listimages/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ patient_id: id }),
        }
      );

      if (!responseImages.ok) {
        throw new Error("Erreur lors du chargement des images");
      }

      const imagesData = await responseImages.json();

      const classified = {
        mammographie: [],
        irm: [],
        echographie: [],
      };

      imagesData.images.forEach((img) => {
        if (img.modalite === "MAMO") {
          classified.mammographie.push(img);
        } else if (img.modalite === "IRM") {
          classified.irm.push(img);
        } else if (img.modalite === "ECO") {
          classified.echographie.push(img);
        }
      });

      setImages(classified);

      setPatient({
        id: patientData.id,
        nom: patientData.nom,
        prenom: patientData.prenom,
        dateNaissance: patientData.date_naissance,
        sexe: patientData.sexe || "Inconnu",
        telephone: patientData.phonenumber,
        email: patientData.email,
        adresse: patientData.adresse,
        numeroSecu: patientData.numero_secu || "N/A",
        images: {
          mammographie: { count: classified.mammographie.length },
          irm: { count: classified.irm.length },
          echographie: { count: classified.echographie.length },
        },
      });
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Nettoyer les URLs blob
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        console.log("🧹 Blob URL nettoyée");
      }
    };
  }, [pdfBlobUrl]);

  const handleAddImage = (imageType) => {
    setSelectedImageType(imageType);
    setShowAddImage(true);
  };

  const handleSaveImage = () => {
    setShowAddImage(false);
    fetchData();
  };

  const handleDeleteImage = (imageId, imageType) => {
    setImages((prev) => ({
      ...prev,
      [imageType]: prev[imageType].filter((img) => img.id !== imageId),
    }));
    fetchData();
  };

  const handleViewImages = (imageType) => {
    setSelectedImageType(imageType);
    setShowGallery(true);
  };

  // ✅ FONCTION UNIFIÉE POUR GÉNÉRER ET TESTER LES PDF
  const handlePdfAction = async (patientId, action = "generate") => {
    try {
      setIsLoading(true);
      setPdfBlobUrl(null);
      setPdfGenerated(false);

      if (action === "generate") {
        // Générer le rapport via IA d'abord
        console.log("🚀 Génération du rapport IA...");
        const response = await fetch(
          `http://${config.DjangoHost}:8000/api/ia/analyse/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ patientid: patientId }),
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur génération rapport (${response.status})`);
        }

        const data = await response.json();
        
        if (!data.rapport) {
          throw new Error("Erreur lors de la génération du rapport IA");
        }

        console.log("✅ Rapport IA généré, téléchargement du PDF...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      // Télécharger le PDF (commun aux deux actions)
      console.log(`📥 Téléchargement du PDF (action: ${action})...`);
      const pdfResponse = await fetch(
        `http://${config.DjangoHost}:8000/api/ia/rapport/${patientId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/pdf",
          },
        }
      );

      if (!pdfResponse.ok) {
        throw new Error(`Erreur téléchargement PDF (${pdfResponse.status})`);
      }

      const blob = await pdfResponse.blob();

      if (blob.size === 0) {
        throw new Error("Le PDF reçu est vide");
      }

      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);
      setPdfGenerated(true);
      setIsLoading(false);

      console.log(`✅ PDF ${action === "generate" ? "généré et " : ""}chargé - Taille:`, blob.size, "bytes");

    } catch (error) {
      console.error(`❌ Erreur ${action === "generate" ? "génération" : "test"} PDF:`, error);
      alert(`Échec: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Fonctions wrapper pour une meilleure lisibilité
  const handleGenerateReport = (patientId) => handlePdfAction(patientId, "generate");
  const testPdfAccess = (patientId) => handlePdfAction(patientId, "test");

  if (!patient) return <div>Chargement...</div>;

  return (
    <div className="patient-detail-container">
      {!showGallery ? (
        <>
          <div className="patient-info-section">
            <h2>Informations Patient</h2>
            <div className="patient-info-grid">
              <div className="info-group">
                <label>Nom complet</label>
                <p>
                  {patient.prenom} {patient.nom}
                </p>
              </div>
              <div className="info-group">
                <label>Date de naissance</label>
                <p>{patient.dateNaissance}</p>
              </div>
              <div className="info-group">
                <label>Sexe</label>
                <p>{patient.sexe}</p>
              </div>
              <div className="info-group">
                <label>Téléphone</label>
                <p>{patient.telephone}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{patient.email}</p>
              </div>
              <div className="info-group">
                <label>Adresse</label>
                <p>{patient.adresse}</p>
              </div>
              <div className="info-group">
                <label>Numéro de sécurité sociale</label>
                <p>{patient.numeroSecu}</p>
              </div>
            </div>
          </div>

          <div className="radiological-section">
            <h2>Images Radiologiques</h2>
            <div className="image-buttons-container">
              <div
                className="image-button"
                onClick={() => handleViewImages("mammographie")}
              >
                <div className="icon-container">
                  <img
                    src={mammoIcon}
                    alt="Mammographie"
                    className="type-icon"
                  />
                  <span className="count-badge">
                    {patient.images.mammographie.count}
                  </span>
                </div>
                <button
                  className="add-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddImage("MAMO");
                  }}
                >
                  +
                </button>
              </div>

              <div
                className="image-button"
                onClick={() => handleViewImages("irm")}
              >
                <div className="icon-container">
                  <img src={irmIcon} alt="IRM" className="type-icon" />
                  <span className="count-badge">
                    {patient.images.irm.count}
                  </span>
                </div>
                <button
                  className="add-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddImage("IRM");
                  }}
                >
                  +
                </button>
              </div>

              <div
                className="image-button"
                onClick={() => handleViewImages("echographie")}
              >
                <div className="icon-container">
                  <img src={echoIcon} alt="Échographie" className="type-icon" />
                  <span className="count-badge">
                    {patient.images.echographie.count}
                  </span>
                </div>
                <button
                  className="add-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddImage("ECO");
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="generate-report-container">
            <button
              className="generate-report-button"
              onClick={() => handleGenerateReport(patient.id)}
              disabled={isLoading}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "10px",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading
                ? "⏳ Génération en cours..."
                : "🧠 Générer rapport radiologique par IA"}
            </button>

            <button
              onClick={() => testPdfAccess(patient.id)}
              disabled={isLoading}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              🔍 Charger rapport
            </button>
          </div>

          {pdfGenerated && (
            <div
              style={{
                marginTop: "40px",
                textAlign: "center",
                border: "1px solid #ccc",
                borderRadius: "10px",
                overflow: "hidden",
                padding: "20px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>📄 Rapport Radiologique</h3>

              {pdfBlobUrl ? (
                <>
                  <div
                    style={{
                      marginBottom: "15px",
                      padding: "10px",
                      backgroundColor: "#d4edda",
                      borderRadius: "5px",
                      fontSize: "14px",
                      color: "#155724",
                    }}
                  >
                    ✅ Rapport généré et chargé avec succès
                  </div>

                  <iframe
                    key={pdfBlobUrl}
                    src={pdfBlobUrl}
                    width="100%"
                    height="700px"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                    title="Rapport Radiologique"
                  />

                  <div
                    style={{
                      marginTop: "15px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                    }}
                  >
                    <a
                      href={pdfBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        textDecoration: "none",
                        padding: "8px 15px",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      🔗 Ouvrir dans un nouvel onglet
                    </a>

                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = pdfBlobUrl;
                        link.download = `rapport_patient_${patient.id}.pdf`;
                        link.click();
                      }}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      📥 Télécharger le PDF
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "5px",
                    color: "#856404",
                  }}
                >
                  ⏳ Chargement du PDF...
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="gallery-page">
          <div className="gallery-header">
            <button
              style={{ minHeight: 35 }}
              onClick={() => setShowGallery(false)}
            >
              ← Retour
            </button>
          </div>
          <h2>Images {selectedImageType}</h2>
          <ImageGallery
            images={images[selectedImageType]}
            imageType={selectedImageType}
            onDeleteImage={handleDeleteImage}
          />
        </div>
      )}

      {showAddImage && (
        <AddImage
          patientId={id}
          imageType={selectedImageType}
          onClose={() => setShowAddImage(false)}
          onSave={handleSaveImage}
        />
      )}
        {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Traitement en cours...</div>
        </div>
      )}
    </div>
  );
}

export default PatientDetail;