"use client";

import React, { useState, useRef } from "react";
import "./ImageGallery.css";
import { prepareAnnotationData } from "./backend-functions";
import fetchWithAuth from "../fetchWithAuth";

export async function saveAnnotationsToBackend(
  data,
  overwrite = false,
  append = false
) {
  const token = localStorage.getItem("access_token");
  const response = await fetchWithAuth(
    "http://localhost:8000/api/sauvgarderAnnotation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, overwrite, append }),
    }
  );

  const result = await response.json();

  if (result.status === "exists") {
    const confirmOverwrite = window.confirm(
      result.message +
        "\n\nCliquez sur OK pour écraser les anciennes annotations.\nCliquez sur Annuler pour ajouter par-dessus."
    );

    if (confirmOverwrite) {
      // L'utilisateur veut écraser
      return await saveAnnotationsToBackend(data, true, false);
    } else {
      // L'utilisateur veut ajouter par-dessus
      return await saveAnnotationsToBackend(data, false, true);
    }
  }

  if (!response.ok || result.status !== "success") {
    throw new Error(
      result.message || "Erreur lors de la sauvegarde des annotations."
    );
  }

  return result;
}
// ✅ Fonction IA
export function runAIAnalysis(eco_path) {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem("access_token");
    const url = `http://127.0.0.1:8000/api/ia/eco/`;

    fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ path: eco_path }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error("Erreur serveur : " + response.status);
        return response.json();
      })
      .then((data) => {
        if (!data.boxes || !Array.isArray(data.boxes)) {
          throw new Error("Format de réponse invalide");
        }
        const flattenedBoxes = data.boxes.flat();
        const aiResults = flattenedBoxes.map((box, index) => {
          const [x1, y1, x2, y2] = box;
          return {
            id: Date.now() + index,
            x: x1,
            y: y1,
            w: x2 - x1,
            h: y2 - y1,
            source: "AI",
          };
        });
        resolve({ boxes: aiResults });
      })
      .catch((error) => {
        console.error("Erreur IA:", error);
        reject(error);
      });
  });
}

export default function ImageGallery({
  images: initialImages,
  imageType,
  onDeleteImage,
}) {
  const [images, setImages] = useState(initialImages || []);
  const [selectedImage, setSelectedImage] = useState(initialImages[0] || null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [currentRect, setCurrentRect] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const overlayRef = useRef(null);
  const fileInputRef = useRef(null);
  const ZOOM_STEP = 1.2;

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setAnnotations([]);
    setSelectedId(null);
  };

  const applyZoom = (factor) => setScale((s) => s * factor);

  const handleWheel = (e) => {
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP);
  };

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("icon")) return;

    if (e.button === 2) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (isDrawingMode && overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;
      setCurrentRect({ id: Date.now(), x, y, w: 0, h: 0 });
    } else if (overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;

      const hit = annotations.find(
        (r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
      );

      if (hit) {
        setSelectedId(hit.id);
        setDragId(hit.id);
        setDragOffset({ x: x - hit.x, y: y - hit.y });
      } else {
        setSelectedId(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (currentRect && overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;
      setCurrentRect((r) => ({ ...r, w: x - r.x, h: y - r.y }));
    } else if (dragId !== null && overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;

      setAnnotations((a) =>
        a.map((r) =>
          r.id === dragId
            ? { ...r, x: x - dragOffset.x, y: y - dragOffset.y }
            : r
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (currentRect) {
      if (Math.abs(currentRect.w) > 5 && Math.abs(currentRect.h) > 5) {
        setAnnotations((prev) => [...prev, currentRect]);
      }
      setCurrentRect(null);
    }
    if (dragId !== null) {
      setDragId(null);
    }
  };

  const onDoubleClick = () => resetView();

  const triggerFileInput = () => fileInputRef.current.click();

  const loadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const result = await loadImageFromFile(file);
      const newImage = {
        id: Date.now(),
        path: result.image.src,
        date: new Date().toLocaleDateString(),
      };
      setSelectedImage(newImage);
      setFileName(result.fileName);
      setImageSize(result.imageSize);
      resetView();
      if (!images.some((img) => img.path === newImage.path)) {
        setImages((prev) => [...prev, newImage]);
      }
    } catch (err) {
      alert("Erreur image: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runAI = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    try {
      const ecoPath = selectedImage.path.replace("http://localhost:8000/", "");
      const { boxes } = await runAIAnalysis(ecoPath);
      setAnnotations((prev) => [...prev, ...boxes]);
    } catch (err) {
      alert("Erreur IA: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnnotations = async () => {
    if (!selectedImage) {
      console.error("Aucune image sélectionnée");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Tentative de chargement pour image ID:", selectedImage.id);

      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/load-annotations?image_id=${selectedImage.id}`
      );

      console.log("Réponse du serveur:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur serveur:", errorText);
        throw new Error("Erreur lors du chargement des annotations.");
      }

      const data = await response.json();
      console.log("Données reçues:", data);

      // Nouveau traitement plus robuste
      let boxes = [];
      if (data.boxes && Array.isArray(data.boxes)) {
        boxes = data.boxes.flat(); // Aplatir si nécessaire
        console.log("Boxes après traitement:", boxes);

        // Formatage standard
        const formattedAnnotations = boxes
          .map((box) => {
            // Si la box est déjà au bon format (avec x,y,w,h)
            if (box.x !== undefined) return box;

            // Si c'est un tableau [x1,y1,x2,y2]
            if (Array.isArray(box)) {
              return {
                id: Date.now() + Math.random(),
                x: box[0],
                y: box[1],
                w: box[2] - box[0],
                h: box[3] - box[1],
                source: "loaded",
              };
            }

            return null;
          })
          .filter(Boolean);

        setAnnotations((prev) => [...prev, ...formattedAnnotations]);
        console.log("Annotations mises à jour:", formattedAnnotations);
      } else {
        console.warn("Aucune box trouvée ou format invalide");
      }
    } catch (err) {
      console.error("Erreur complète:", err);
      alert("Erreur lors du chargement des annotations : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const saveToBackend = async () => {
    if (!selectedImage.path) return;
    const image_id = selectedImage.id;

    const data = prepareAnnotationData({
      image_id,
      imageSize,
      annotations,
      measurements: [],
      aiResults: [],
    });

    try {
      const result = await saveAnnotationsToBackend(data);
      alert(result.message);
    } catch (err) {
      alert("Erreur annotation: " + err.message);
    }
  };

  const handleDeleteAPI = async () => {
    if (!selectedImage) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetchWithAuth(
        "http://localhost:8000/api/patient/supprimerimage/",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: selectedImage.id }),
        }
      );
      const data = await response.json();
      if (!response.ok || data.status !== "success")
        throw new Error(data.message || "Erreur suppression");

      // ✅ Met à jour images et sélection localement
      setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== selectedImage.id);
        setSelectedImage(updated[0] || null);
        return updated;
      });
      resetView();

      // ✅ Notifie le parent si besoin
      onDeleteImage(selectedImage.id, imageType);

      alert("Image supprimée !");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleDeleteGI = async () => {
    await handleDeleteAPI();
    setShowDeleteConfirm(false);
  };

  const deleteSelected = () => {
    if (selectedId !== null) {
      setAnnotations((a) => a.filter((r) => r.id !== selectedId));
      setSelectedId(null);
    }
  };

  let iconPos = { left: 0, top: 0 };
  if (selectedId !== null) {
    const sel = annotations.find((r) => r.id === selectedId);
    if (sel) {
      iconPos = {
        left: sel.x + sel.w + 5,
        top: sel.y - 20,
      };
    }
  }

  return (
    <div className="image-gallery-container">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={loadImage}
      />

      <div className="thumbnails-sidebar">
        <div className="thumbnails-header">Images {imageType}</div>
        <div className="thumbnails-list">
          {images.map((img) => (
            <div
              key={img.id}
              className={`thumbnail ${
                selectedImage?.id === img.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedImage(img);
                resetView();
              }}
            >
              <img src={img.path} alt={`Miniature`} />
              <span>{img.date || "N/A"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content1">
        <div className="canvas-section">
          <div
            className="canvas-wrapper"
            ref={overlayRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            //onWheel={handleWheel}
            onDoubleClick={onDoubleClick}
          >
            {selectedImage && (
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                  transformOrigin: "top left",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <img
                  src={selectedImage.path}
                  alt="Sélection"
                  style={{
                    display: "block",
                    objectFit: "contain",
                  }}
                />

                {annotations.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      position: "absolute",
                      left: `${r.x}px`,
                      top: `${r.y}px`,
                      width: `${r.w}px`,
                      height: `${r.h}px`,
                      border:
                        r.id === selectedId
                          ? "2px solid blue"
                          : r.source === "AI"
                          ? "2px solid lime"
                          : "2px solid red",
                      background: "rgba(255,0,0,0.1)",
                    }}
                  />
                ))}

                {currentRect && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${Math.min(
                        currentRect.x,
                        currentRect.x + currentRect.w
                      )}px`,
                      top: `${Math.min(
                        currentRect.y,
                        currentRect.y + currentRect.h
                      )}px`,
                      width: `${Math.abs(currentRect.w)}px`,
                      height: `${Math.abs(currentRect.h)}px`,
                      border: "2px dashed blue",
                    }}
                  />
                )}

                {selectedId !== null && (
                  <div
                    className="icon delete-icon"
                    style={{
                      position: "absolute",
                      top: `${iconPos.top}px`,
                      left: `${iconPos.left}px`,
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSelected();
                    }}
                    title="Supprimer annotation"
                  >
                    🗑️
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="image-gallery-container">
            {annotations.length > 0 && (
              <div className="annotations-count-message">
                {annotations.length} annotation(s) détectée(s)
              </div>
            )}{" "}
          </div>

          {!showDeleteConfirm ? (
            <>
              <div
                className="image-actions"
                style={{ alignContent: "center", justifyContent: "center" }}
              >
                <button onClick={() => setIsDrawingMode((p) => !p)}>
                  ✏️ {isDrawingMode ? "ON" : "OFF"} Annotation
                </button>
                <button onClick={resetView}>🔄 Réinitialiser</button>
                <button onClick={() => applyZoom(ZOOM_STEP)}>🔍+</button>
                <button onClick={() => applyZoom(1 / ZOOM_STEP)}>🔍-</button>
                <button onClick={runAI}>🧠 Analyse IA</button>
                <button onClick={loadAnnotations}>📥 Charger</button>
                <button onClick={saveToBackend}>💾 Sauvegarder</button>
                <button onClick={() => setShowDeleteConfirm(true)}>
                  🗑️ Supprimer Image
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="image-actions"
                style={{ alignContent: "center", justifyContent: "center" }}
              >
                <div className="delete-confirm">
                  <span>⚠️ Confirmer la suppression ?</span>
                  <button className="confirm-yes" onClick={handleDeleteGI}>
                    Oui
                  </button>
                  <button
                    className="confirm-no"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Non
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
