# Imports Django
from django.http import JsonResponse

# Décorateurs DRF et sécurité
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from APPI.decorators_token import token_required

# Modèles
from APPI.models.ImageRadiologique import ImageRadiologique

from APPI.models.Role import require_any_role, Role

# Autres
from django.conf import settings
import base64
# Get only the relative path after MEDIA_ROOT
import os

# Endpoint pour récupérer les détails d’une image radiologique depuis un JSON contenant l’id

@csrf_exempt
@token_required
@api_view(['POST'])
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE)
def get_image_radiologique(request):
    try:
        # Lecture de l'image_id depuis le body JSON
        image_id = request.data.get('image_id')
        if not image_id:
            return JsonResponse({
                "status": "error",
                "message": "Champ 'image_id' requis dans le corps de la requête."
            }, status=400)

        # Recherche de l'image
        try:
            image = ImageRadiologique.objects.get(id=image_id)
        except ImageRadiologique.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Image introuvable."
            }, status=404)

        # Calculate URL after we have the image object
        relative_path = f'{settings.BASE_DIR}/{image.path}'
        url = f"{settings.MEDIA_ROOT}/{relative_path}"

        # Construction de la réponse
        response_data = {
            "id": image.id,
            "date": image.date.strftime("%Y-%m-%d"),
            "modalite": image.modalite,
            "url": url,
            "patient": {
                "id": image.patient.id,
                "nom": image.patient.nom,
                "prenom": image.patient.prenom,
                "date_naissance": image.patient.date_naissance.strftime("%Y-%m-%d"),
            }
        }
        
        # Lire le fichier image en binaire
        print(relative_path)

        with open(relative_path, "rb") as f:
            encoded_string = base64.b64encode(f.read()).decode('utf-8')

        # Ajouter le Base64 au JSON
        # (optionnel : préfixe avec le type MIME pour le frontend)
        ext=os.path.basename(url).split(".")[-1]
        mime_type = f"image/{ext}"  # ou "image/jpeg" selon ton fichier
        print(mime_type)
        response_data["image_base64"] = f"data:{mime_type};base64,{encoded_string}"

        return JsonResponse({
            "status": "success",
            "message": "Image récupérée avec succès.",
            "image": response_data
        }, status=200)

    except Exception as e:
        print(str(e))
        return JsonResponse({
            "status": "error",
            "message": f"Erreur inattendue : {str(e)}"
            
        }, status=500)