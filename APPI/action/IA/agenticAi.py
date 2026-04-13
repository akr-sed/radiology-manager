# ========================
# IMPORTS CORRIGÉS POUR LANGCHAIN 1.2.13
# ========================
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import Tool
from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import PromptTemplate

import os
from APPI.models.ImageRadiologique import ImageRadiologique
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.iamodel import yolo_model, yolo_IRM_model, yolo_MAMO_model
# Décorateurs DRF et sécurité
from rest_framework.decorators import api_view
from APPI.decorators_token import token_required
import os
from APPI.models.patient import Patient
from django.http import JsonResponse
import json
from APPI.models.Role import require_any_role, Role
#
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import pypandoc


import os
import pypandoc

def CreateandcompileLatexfile(texte, patientid="X"):
    """
    Crée un rapport radiologique en LaTeX et le compile en PDF.
    """
    # Nettoyage du contenu LaTeX si besoin
    latex_content = texte.strip()

    # Création des répertoires
    base_dir = "media\\Rapports"
    patient_dir = os.path.join(base_dir, str(patientid))
    os.makedirs(patient_dir, exist_ok=True)

    # Sauvegarde du LaTeX dans un fichier .tex
    tex_filename = os.path.join(patient_dir, "rapport_radiologique.tex")
    with open(tex_filename, "w", encoding="utf-8") as f:
        f.write(latex_content)

    # Nom du fichier PDF de sortie
    pdf_filename = os.path.join(patient_dir, f"rapport_radiologique_{patientid}.pdf")

    try:
        # Conversion du LaTeX en PDF avec pypandoc
        pypandoc.convert_text(
            latex_content,
            'pdf',
            format='latex',
            outputfile=pdf_filename,
            extra_args=['--standalone']
        )
        print(f"✅ Rapport PDF généré : {pdf_filename}")
        return pdf_filename

    except Exception as e:
        print(f"❌ Erreur lors de la génération du PDF : {e}")
        return None





# ========================
# 🔑 1. Clé d’API Gemini
# ========================
os.environ["GOOGLE_API_KEY"] = "AIzaSyBzmqxrJFZsXWXhq4A6rC3FD7A7fz6GG4M"  # Remplace par ta vraie clé

# ========================
# 🔍 2. Ton modèle PyTorch / fonction d'analyse
# ========================
def formatResult(result):
    detections = []

    # result peut contenir plusieurs images (dans une batch)
    for res in result:
        names = res.names  # dictionnaire {id_classe: nom_classe}
        for box in res.boxes:
            cls_id = int(box.cls[0].item())              # ID classe
            cls_name = names[cls_id]                     # Nom de la classe
            conf = float(box.conf[0].item())             # Confiance
            x1, y1, x2, y2 = box.xyxy[0].tolist()        # Coordonnées absolues
            width = x2 - x1
            height = y2 - y1

            detections.append({
                "classe": cls_name,
                "confiance (%)": round(conf * 100, 2),
                "coordonnées": {
                    "x1": round(x1, 1), "y1": round(y1, 1),
                    "x2": round(x2, 1), "y2": round(y2, 1)
                },
                "taille (px)": f"{width:.1f}×{height:.1f}"
            })

    return detections


def run_YoloEco(image_path):
    # Ici tu peux insérer ton code d’inférence PyTorch
    # Exemple : charger l’image, prédire, retourner le label
    results = formatResult(yolo_model(image_path, verbose=False))
           
    return f"Résultat du modèle Yolov11n sur l'image Echographique est {results}"
def run_YoloIRM(image_path):
    # Ici tu peux insérer ton code d’inférence PyTorch
    # Exemple : charger l’image, prédire, retourner le label
    results = formatResult(yolo_IRM_model(image_path, verbose=False))
           
    return f"Résultat du modèle Yolov11n sur l'image IRM est {results}"

def run_YoloMamographique(image_path):
    # Ici tu peux insérer ton code d’inférence PyTorch
    # Exemple : charger l’image, prédire, retourner le label
    results = formatResult(yolo_MAMO_model(image_path, verbose=False))
           
    return f"Résultat du modèle Yolov11n sur l'image Mamographique est {results}"



# ========================
# 🤖 Modèle Ollama local
# ========================

llm = ChatOllama(
    model="qwen3-vl:235b-cloud",
    temperature=0.2,
    streaming=True,
)

# ========================
# 🧩 Définition des outils
# ========================

tools = [
    Tool(
        name="MamoYolov11n",
        func=run_YoloMamographique,
        description="Analyse d'image mammographique pour détecter des masses ou anomalies mammaires."
    ),
    Tool(
        name="EcoYolov11n",
        func=run_YoloEco,
        description="Analyse d'image échographique pour détecter des masses ou anomalies mammaires."
    ),
    Tool(
        name="IRMYolov11n",
        func=run_YoloIRM,
        description="Analyse d'image IRM pour détecter des masses ou anomalies mammaires."
    ),
  
]

# ========================
# 📝 Prompt template pour l'agent
# ========================

prompte = r"""
Tu es un **assistant radiologue virtuel spécialisé en imagerie mammaire**.  
Ton rôle est de **vérifier et interpréter les résultats d'analyse produits par trois modèles de détection** (issus de YOLOv11) appliqués sur différentes modalités d'imagerie d'un même patient.  
Ton objectif final est de **rédiger un rapport radiologique clinique unique et complet** qui résume les constatations de toutes les images, tout en évaluant la cohérence et la validité clinique des détections observées.

---

###  Contexte d'analyse

Tu disposes de trois modèles spécialisés :
1. **YOLOv11_MAMO** → pour les mammographies (incidences CC, MLO)
2. **YOLOv11_ECHO** → pour les échographies mammaires
3. **YOLOv11_IRM** → pour les IRM mammaires

Chaque modèle renvoie des **résultats de détection** (zones suspectes, microcalcifications, masses, distorsions, etc.) avec leurs coordonnées et niveaux de confiance.

Ton rôle est de :
- Vérifier la **cohérence médicale** des résultats.
- Identifier les **lésions pertinentes** et **écarter les faux positifs évidents**.
- Générer un **rapport unifié par patient**, en fusionnant les informations issues de toutes les images disponibles.

---

###  Procédure d'analyse

1. **Vérification des résultats**
   - Examine les résultats fournis (classes, coordonnées, scores de confiance).

2. **Synthèse multi-modale**
   - Corrèle les observations entre mammographie, IRM et échographie.
   
3. **Interprétation clinique**
   - Classe les résultats selon la classification **BI-RADS** :
     - BI-RADS 1 → Examen normal
     - BI-RADS 2 → Lésion bénigne
     - BI-RADS 3 → Probablement bénigne
     - BI-RADS 4 → Suspecte (biopsie recommandée)
     - BI-RADS 5 → Forte suspicion de malignité
   - Intègre les détections pertinentes et leur concordance inter-modale dans la décision finale.

---

### Format attendu du output

\documentclass[a4paper,12pt]{article}
\usepackage[french]{babel}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{setspace}
\usepackage{titlesec}
\usepackage{xcolor}
\usepackage{array}

\geometry{margin=2.5cm}
\setstretch{1.3}

\titleformat{\section}{\large\bfseries\color{blue}}{}{0pt}{}
\titleformat{\subsection}{\normalsize\bfseries\color{teal}}{}{0pt}{}

\begin{document}

\begin{center}
    {\LARGE \textbf{Rapport Radiologique Automatisé — Analyse Multi-Modale}}\\[1.5em]
    \rule{0.9\linewidth}{0.5pt}\\[1em]
\end{center}

\noindent
\textbf{Type d'examens :} \textit{Mammographie (CC/MLO), IRM, Échographie}\\
\textbf{Sein examiné :} \textit{Droit / Gauche / Bilatéral}\\
\textbf{Motif d'examen :} \textit{Dépistage / Contrôle / Suivi}\\[1em]

% ======================
\section*{Analyse radiologique}
% ======================
\noindent
Les images issues des différentes modalités ont été analysées par les modèles de détection automatisée.  
Les constatations principales sont résumées comme suit :

\begin{itemize}
    \item \textbf{Mammographie :} présence d'une opacité nodulaire spiculée de $12$~mm dans le quadrant supéro-externe du sein droit (vue CC et MLO).
    \item \textbf{IRM mammaire :} rehaussement focal correspondant à la même localisation, mesurant $11.5$~mm, sans extension satellite visible.
    \item \textbf{Échographie :} lésion hypoéchogène irrégulière, non compressible, avec renforcement postérieur modéré.
\end{itemize}

\noindent
Une corrélation positive est observée entre les constatations des trois modalités.  
Aucune adénopathie axillaire suspecte n'a été détectée.

% ======================
\section*{Interprétation diagnostique}
% ======================
\noindent
La convergence des résultats multi-modaux suggère une \textbf{lésion mammaire suspecte unique}.  
Les caractéristiques morphologiques et dynamiques sont compatibles avec une masse suspecte à forte probabilité de malignité.\\[0.5em]

\noindent
\textbf{Classification BI-RADS globale :} \fbox{\textbf{BI-RADS 5 — Hautement suspecte de malignité}}\\[1em]

% ======================
\section*{Conclusion}
% ======================
\noindent
Présence d'une lésion suspecte du sein droit confirmée à la mammographie, à l'échographie et à l'IRM.  
Recommandation : \textbf{biopsie ciblée sous échographie ou IRM} pour confirmation histologique.\\[1em]

\noindent\rule{0.9\linewidth}{0.5pt}\\[1em]
\textit{Rapport généré automatiquement par le système d'analyse radiologique multi-modale.}\\
\textit{Les résultats doivent être validés par un radiologue.}

\end{document}
---

### 🚫 Règles importantes
- Ne mentionne jamais les termes : *modèle, IA, YOLO, bounding box, confiance, réseau de neurones, algorithme, prédiction*.
- Le ton doit être **strictement médical et professionnel**.
- Fournis toujours un **rapport complet**, même si aucune lésion n'est détectée.
- Si tout est normal → indiquer : *Aucune anomalie détectée. Classification BI-RADS : 1.*

---

### 🔧 Entrées attendues pour chaque patient :
- `images` : liste d'images disponibles (mammographies, échographies, IRM)
- `results` : détections issues de chaque modèle YOLOv11 (classes, positions, scores)
- `context` : métadonnées cliniques éventuelles (âge, antécédents, côté, incidence)

Thought: J'analyse les données d'imagerie fournies pour générer un rapport radiologique complet selon les standards médicaux.

Action: Génère un seul document unique LaTeX bien formaté sur tous le dossier médical, prêt à être compilé, contenant le rapport médical complet. Ne genère pas des documents latex pour chaque image analysée.
"""

# ========================
# 🧠 Initialisation de l'agent avec LangChain 1.2.13
# ========================

# Création du template de prompt pour l'agent
agent_prompt = PromptTemplate.from_template("""Réponds en français. Tu es un assistant radiologue virtuel.

Tu as accès aux outils suivants:
{tools}

Utilise le format suivant:

Question: l'entrée que tu dois traiter
Thought: réfléchis à ce qu'il faut faire
Action: le nom de l'outil à utiliser, doit être parmi [{tool_names}]
Action Input: l'entrée pour l'action
Observation: le résultat de l'action
... (ce processus peut se répéter plusieurs fois)
Thought: je sais maintenant la réponse finale
Final Answer: la réponse finale à la question originale

Commence!

Question: {input}
Thought: {agent_scratchpad}
""")

# Création de l'agent
agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=agent_prompt,
)

# Création de l'exécuteur
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,
)

# ========================
# 🚀 Fonction principale
# ========================

@token_required
@api_view(['POST'])
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE)
def performeCancerAnalyseAgenticApproach(request):
    try:
        data = json.loads(request.body)
        patientid = int(data.get("patientid"))
        p = Patient.objects.get(id=patientid)
        listimages = ImageRadiologique.objects.filter(patient=p).order_by('-date')
        
        image_text = "\n".join([f"- {os.path.realpath('.')}{img.path}" for img in listimages])

        # Exécution de l'agent
        res = agent_executor.invoke({
            "input": f"{prompte}\nVoici la liste d'images à analyser:\n{image_text}"
        })
        
        print(res["output"])
        rapport_filename = CreateandcompileLatexfile(res["output"], patientid=patientid)
        pdf_url = rapport_filename.replace("\\", "/") 
        
        return JsonResponse({
            'rapport': True,
            'pdf_url': pdf_url,
            'message': 'Rapport généré avec succès'
        })

    except Exception as e:
        print(str(e))
        return JsonResponse({"status": "error", "message": str(e)}, status=500)