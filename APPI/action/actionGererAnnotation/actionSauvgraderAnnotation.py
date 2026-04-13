# Django & DRF imports
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status

# Auth
from APPI.decorators_token import token_required
from APPI.models.Role import require_any_role, Role

# Models
from APPI.models.ImageRadiologique import ImageRadiologique

import json
from django.conf import settings
import os
class AnnotationCarree:
    def __init__(self, image, x, y, largeur, hauteur, etiquette=None):
        self.image = image
        self.x = x
        self.y = y
        self.largeur = largeur
        self.hauteur = hauteur
        self.etiquette = etiquette  # Champ optionnel

    def __repr__(self):
        return (
            f"AnnotationCarree(image={self.image}, x={self.x}, y={self.y}, "
            f"largeur={self.largeur}, hauteur={self.hauteur}, etiquette={self.etiquette})"
        )

@csrf_exempt
@token_required
@api_view(['POST'])
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE)
def actionSauvgraderAnnotation(request):
    """
    Sauvegarde les annotations d'une image radiologique :
    - overwrite = True -> supprime et remplace
    - append = True -> ajoute sans supprimer
    """
    try:
        data = request.data
        image_info = data.get('imageInfo')
        annotations = data.get('annotations')
        overwrite = data.get('overwrite', False)
        append_mode = data.get('append', False)

        if not image_info or not annotations:
            return JsonResponse({
                "status": "error",
                "message": "Les champs 'imageInfo' et 'annotations' sont requis."
            }, status=status.HTTP_400_BAD_REQUEST)

        image_id = image_info.get("image_id")
        if not image_id:
            return JsonResponse({
                "status": "error",
                "message": "Le champ 'image_id' est manquant dans 'imageInfo'."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = ImageRadiologique.objects.get(id=image_id)
        except ImageRadiologique.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": f"Aucune image trouvée pour l'ID '{image_id}'."
            }, status=status.HTTP_404_NOT_FOUND)

        # Valider les nouvelles annotations
        validation_errors = []
        valid_annotations = []

        for idx, ann in enumerate(annotations):
            x, y, width, height = ann.get("x"), ann.get("y"), ann.get("width"), ann.get("height")
            note = ann.get("note", "")

            if None in [x, y, width, height]:
                validation_errors.append(f"Annotation #{idx + 1} : champs manquants.")
                continue

            try:
                x, y, width, height = float(x), float(y), float(width), float(height)
            except (ValueError, TypeError):
                validation_errors.append(f"Annotation #{idx + 1} : coordonnées invalides (doivent être numériques).")
                continue

            if width <= 0 or height <= 0:
                validation_errors.append(f"Annotation #{idx + 1} : dimensions invalides (doivent être positives).")
                continue

            valid_annotations.append({
                "x": x,
                "y": y,
                "largeur": width,
                "hauteur": height,
                "etiquette": note
            })

        if validation_errors:
            return JsonResponse({
                "status": "failed",
                "message": " ".join(validation_errors)
            }, status=status.HTTP_400_BAD_REQUEST)

       

        # Optionnel : sauvegarder aussi en base si besoin
        new_objects = []
        for ann in valid_annotations:
            new_objects.append(AnnotationCarree(
                image=image,
                x=ann["x"],
                y=ann["y"],
                largeur=ann["largeur"],
                hauteur=ann["hauteur"],
                # Ajoute le champ etiquette si tu l’as dans le modèle
            ))


        # ✅ Construire le chemin JSON proprement SANS le slash devant
        image_dir = os.path.dirname(image.path)
        image_name_wo_ext = image.path.split(".")[0]
        json_path = f'{settings.BASE_DIR}/{image_name_wo_ext}.json'
        print(settings.BASE_DIR)
        print(json_path)
        # ✅ Sauvegarder le fichier JSON
        with open(json_path, "w") as f:
            json.dump(valid_annotations, f, indent=4)

        print(f"Annotations sauvegardées dans : {json_path}")


        return JsonResponse({
            "status": "success",
            "message": f"{len(valid_annotations)} annotation(s) sauvegardée(s) avec succès."
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Erreur serveur : {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
