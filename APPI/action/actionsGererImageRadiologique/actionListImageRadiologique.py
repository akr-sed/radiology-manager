from django.http import JsonResponse
from rest_framework.decorators import api_view
from APPI.decorators_token import token_required
from APPI.models import Patient
from APPI.models.ImageRadiologique import ImageRadiologique
from APPI.models.Role import require_any_role, Role
from django.conf import settings
import os
import json

@token_required
@api_view(['POST'])
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE)
def lister_images_radiologiques(request):
    try:
        # Parse JSON body
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Le format de la requête JSON est invalide."
            }, status=400)

        patient_id = data.get('patient_id')
        if patient_id is None:
            return JsonResponse({
                "status": "error",
                "message": "Le champ 'patient_id' est requis."
            }, status=400)

        # Validate patient_id as integer
        try:
            patient_id_int = int(patient_id)
        except (ValueError, TypeError):
            return JsonResponse({
                "status": "error",
                "message": "ID patient invalide."
            }, status=400)

        # Check patient existence
        try:
            patient = Patient.objects.get(id=patient_id_int)
        except Patient.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Patient introuvable."
            }, status=404)

        # Retrieve images ordered by date descending
        images = ImageRadiologique.objects.filter(patient=patient).order_by('-date')

        image_list = []
        for image in images:
            rel_path = os.path.relpath(image.path, settings.MEDIA_ROOT)
            url = settings.MEDIA_URL + rel_path.replace("\\", "/")  # Normalize slashes

            image_list.append({
                "id": image.id,
                "date": image.date.strftime("%Y-%m-%d"),
                "modalite": image.modalite,
                "url": url
            })

        return JsonResponse({
            "status": "success",
            "message": "Images récupérées avec succès.",
            "images": image_list
        }, status=200)

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Erreur inattendue : {str(e)}"
        }, status=500)
