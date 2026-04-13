import React, { useState, useRef } from "react";
import { Upload, X, Image, Check } from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";

const styles = {
  dropZone: {
    border: "2px dashed #ddd",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
  },
  dropZoneActive: {
    borderColor: "#0091FF",
    background: "#f0f7ff",
  },
  previewImage: {
    maxHeight: "200px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  buttonsRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "16px",
  },
  fileInfo: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  },
  message: {
    marginTop: "12px",
    fontSize: "14px",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  successMessage: {
    color: "#16a34a",
    background: "#f0fdf4",
  },
  errorMessage: {
    color: "#dc2626",
    background: "#fef2f2",
  },
};

export default function ImageUpload({ patientId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      handleFileSelect(droppedFile);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("patient_id", patientId);

      const response = await fetchWithAuth(`${API_BASE}/api/patient/addimg/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de l'image");
      }

      setMessage({ type: "success", text: "Image envoyee avec succes !" });
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error("Erreur upload:", err);
      setMessage({
        type: "error",
        text: err.message || "Erreur lors de l'envoi de l'image.",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  };

  const dropZoneStyle = {
    ...styles.dropZone,
    ...(dragOver ? styles.dropZoneActive : {}),
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      <div
        style={dropZoneStyle}
        onClick={() => !file && fileInputRef.current && fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <div>
            <Upload size={40} color="#999" style={{ marginBottom: "12px" }} />
            <p style={{ color: "#666", fontSize: "15px", margin: 0 }}>
              Glissez une image ici ou cliquez pour selectionner
            </p>
          </div>
        ) : (
          <div>
            {preview && (
              <img
                src={preview}
                alt="Apercu"
                style={styles.previewImage}
              />
            )}
            <div style={styles.fileInfo}>
              <Image size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} />
              {file.name}
            </div>
            <div style={{ ...styles.fileInfo, fontSize: "13px", color: "#999" }}>
              {formatFileSize(file.size)}
            </div>
            <div style={styles.buttonsRow}>
              <button
                className="btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={uploading}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {uploading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Check size={16} />
                    Envoyer
                  </>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                disabled={uploading}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <X size={16} />
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div
          style={{
            ...styles.message,
            ...(message.type === "success" ? styles.successMessage : styles.errorMessage),
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
