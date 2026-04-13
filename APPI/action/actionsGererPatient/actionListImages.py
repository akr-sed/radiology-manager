from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.models import Patient, ImageRadiologique
from rest_framework.decorators import api_view
from APPI.models.Role import require_any_role, Role
from django.conf import settings
import os

@csrf_exempt
@api_view(['POST'])
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE)
def listImagePatient(request):
    user = request.user

    id = request.data.get('patient_id')
    print(id)
    if not id:
        return JsonResponse({
            "status": "error",
            "message": "Champs obligatoires manquants."
        }, status=400)

    try:
        patient = Patient.objects.get(pk=id)
    except Patient.DoesNotExist:
        return JsonResponse({
            "status": "error",
            "message": "Patient introuvable."
        }, status=404)

    # ✅ Récupérer toutes les images de ce patient
    images = ImageRadiologique.objects.filter(patient=patient)

    # ✅ Préparer la liste pour le JSON
    image_list = []
    for img in images:
        image_list.append({
            "id": img.id,
            "path": request.build_absolute_uri(img.path),  # URL absolue pour le frontend
            "date": img.date.isoformat(),
            "modalite": img.modalite
        })

    return JsonResponse({
        "status": "success",
        "images": image_list
    }, status=200)
