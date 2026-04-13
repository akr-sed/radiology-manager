from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.models import ImageRadiologique
from APPI.models.Role import require_any_role, Role
import json

@csrf_exempt
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE)
def supprimer_image_radiologique(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_id = data.get('id')

            if not image_id:
                return JsonResponse({"status": "error", "message": "ID de l'image radiologique manquant."}, status=400)

            try:
                image = ImageRadiologique.objects.get(id=image_id)
            except ImageRadiologique.DoesNotExist:
                return JsonResponse({"status": "error", "message": "Image radiologique introuvable."}, status=404)

            image_info = {
                "id": image.id,
                "modalite": image.modalite,
                "date": image.date.strftime('%Y-%m-%d'),
                "patient_id": image.patient.id
            }

            image.delete()

            return JsonResponse({
                "status": "success",
                "message": f"Image radiologique supprimée avec succès.",
                "image": image_info
            }, status=200)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Méthode non autorisée"}, status=405)
