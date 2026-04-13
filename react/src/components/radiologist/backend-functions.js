// Fonctions backend pour l'upload d'images et la sauvegarde des annotations

/**
 * Charge une image à partir d'un fichier
 * @param {File} file - Le fichier image à charger
 * @returns {Promise<{image: HTMLImageElement, fileName: string, imageSize: {width: number, height: number}}>}
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Aucun fichier sélectionné"));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;

    img.onload = () => {
      resolve({
        image: img,
        fileName: file.name,
        imageSize: { width: img.width, height: img.height },
      });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erreur lors du chargement de l'image"));
    };
  });
}

export async function loadImageFromId(imageId, token) {
  const response = await fetch("http://localhost:8000/api/getImageRadio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image_id: imageId }),
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(
      data.message || "Erreur lors de la récupération de l'image."
    );
  }

  // Ensure the URL is absolute
  let imageUrl = data.image.url;
  if (!imageUrl.startsWith("http")) {
    imageUrl = `http://localhost:8000${imageUrl}`;
  }

  console.log("URL finale:", imageUrl);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous"; // Important for CORS if needed

    img.onload = () => {
      resolve({
        image: img,
        fileName: imageUrl.split("/").pop(),
        imageSize: { width: img.width, height: img.height },
        meta: data.image,
      });
    };

    img.onerror = () => {
      console.error("Failed to load image from URL:", imageUrl);
      reject(new Error("Erreur lors du chargement de l'image depuis l'URL"));
    };
  });
}

/**
 * Sauvegarde les annotations dans un fichier JSON
 * @param {Object} data - Les données à sauvegarder
 * @param {string} fileName - Le nom du fichier d'origine
 * @returns {Promise<void>}
 */
export function saveAnnotationsToFile(data, fileName) {
  return new Promise((resolve) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `annotations_${fileName.split(".")[0]}.json`;
    link.click();

    // Nettoyer l'URL de l'objet après le téléchargement
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      resolve();
    }, 100);
  });
}

export async function saveAnnotationsToBackend(
  data,
  token,
  overwrite = false,
  append = false
) {
  const response = await fetch(
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
      return await saveAnnotationsToBackend(data, token, true, false);
    } else {
      // L'utilisateur veut ajouter par-dessus
      return await saveAnnotationsToBackend(data, token, false, true);
    }
  }

  if (!response.ok || result.status !== "success") {
    throw new Error(
      result.message || "Erreur lors de la sauvegarde des annotations."
    );
  }

  return result;
}

/**
 * Prépare les données d'annotation pour la sauvegarde
 * @param {Object} params - Les paramètres pour la préparation des données
 * @returns {Object} - Les données formatées pour la sauvegarde
 */
export function prepareAnnotationData({
  image_id,
  imageSize,
  annotations,
  measurements,
  aiResults,
}) {
  
  return {
    imageInfo: {
      image_id: image_id,
      width: imageSize.width,
      height: imageSize.height,
    },
    annotations: annotations.map((r) => ({
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      note: r.note || "",
    })),
    measurements: measurements.map((m) => ({
      type: m.tool,
      startX: m.startX,
      startY: m.startY,
      endX: m.endX,
      endY: m.endY,
      value: calculateMeasurementValue(m),
    })),
    aiResults: aiResults,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calcule la valeur d'une mesure
 * @param {Object} measurement - L'objet de mesure
 * @returns {string} - La valeur calculée avec unité
 */
function calculateMeasurementValue(measurement) {
  if (measurement.tool === "ruler") {
    const dx = measurement.endX - measurement.startX;
    const dy = measurement.endY - measurement.startY;
    return Math.sqrt(dx * dx + dy * dy).toFixed(2) + " mm";
  } else if (measurement.tool === "angle") {
    // Calcule l'angle en degrés
    const dx = measurement.endX - measurement.startX;
    const dy = measurement.endY - measurement.startY;
    return Math.atan2(dy, dx) * (180 / Math.PI).toFixed(1) + "°";
  } else if (measurement.tool === "area") {
    const width = Math.abs(measurement.endX - measurement.startX);
    const height = Math.abs(measurement.endY - measurement.startY);
    return (width * height).toFixed(2) + " mm²";
  } else if (measurement.tool === "hu") {
    // Dans une application réelle, cela échantillonnerait les données d'image
    return "120 HU";
  }
  return "";
}
export function runAIAnalysis(eco_id, patient_id) {
  return new Promise((resolve, reject) => {
    const token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ5OTQwMzI3LCJpYXQiOjE3NDk5MzY3MjcsImp0aSI6ImIwZDFkMmZjZDk4ODQ5ZjdiMmQ2MmU1OTUwNTZjODRmIiwidXNlcl9pZCI6NH0.ap67SqUuNm5FoSwMgjQIaKVwUWGXsQzor9hNNLYL2MU";

    const url = `http://127.0.0.1:8000/api/ia/eco/${eco_id}/${patient_id}/`;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Ajout du header Authorization
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur serveur : " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        if (!data.boxes || !Array.isArray(data.boxes)) {
          throw new Error("Format de réponse invalide");
        }

        // Aplatir le tableau si nécessaire
        const flattenedBoxes = data.boxes.flat();

        const aiResults = flattenedBoxes.map((box, index) => {
          const [x1, y1, x2, y2] = box;
          const w = x2 - x1;
          const h = y2 - y1;

          return {
            id: index + 1,
            box: { x1, y1, x2, y2, w, h },
          };
        });

        resolve(aiResults);
      })
      .catch((error) => {
        console.error("Erreur IA:", error);
        reject(error);
      });
  });
}

/**
 * Génère un diagnostic basé sur les résultats de l'IA
 * @param {Array} findings - Les résultats de l'analyse IA
 * @returns {Object} - Le diagnostic généré
 */
function generateDiagnostic(findings) {
  // Simuler un diagnostic basé sur les résultats
  const hasCriticalFindings = findings.some((f) => f.confidence > 90);
  const hasMultipleFindings = findings.length > 1;

  let severity;
  if (hasCriticalFindings) {
    severity = "élevée";
  } else if (hasMultipleFindings) {
    severity = "modérée";
  } else {
    severity = "faible";
  }

  // Générer des recommandations basées sur les résultats
  const recommendations = [];

  if (findings.some((f) => f.type.includes("Nodule"))) {
    recommendations.push(
      "Suivi à 3 mois recommandé pour évaluer l'évolution du nodule"
    );
  }

  if (findings.some((f) => f.type.includes("Opacité"))) {
    recommendations.push(
      "Corrélation clinique suggérée pour évaluer la signification de l'opacité en verre dépoli"
    );
  }

  if (findings.some((f) => f.type.includes("Épaississement"))) {
    recommendations.push(
      "Évaluation complémentaire par TDM avec contraste pourrait être bénéfique"
    );
  }

  // Ajouter une recommandation générale si aucune spécifique n'est générée
  if (recommendations.length === 0) {
    recommendations.push("Suivi clinique standard recommandé");
  }

  return {
    summary: `Analyse radiologique montrant ${findings.length} anomalie(s) avec une priorité clinique ${severity}.`,
    severity: severity,
    recommendations: recommendations,
    confidence: Math.round(
      findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length
    ),
    timestamp: new Date().toISOString(),
  };
}
