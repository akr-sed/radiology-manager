from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from APPI.models import ImageRadiologique, Patient
from APPI.models.Role import require_any_role, Role
import json
import datetime

@csrf_exempt
@require_http_methods(["POST"])
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE)
def ajouter_image_radiologique(request):
    try:
        data = json.loads(request.body)

        patient_id = data.get("patient_id")
        path = data.get("path")
        date_str = data.get("date")
        modalite = data.get("modalite")

        if not all([patient_id, path, date_str, modalite]):
            return JsonResponse({
                "status": "error",
                "message": "Tous les champs (patient_id, path, date, modalite) sont requis."
            }, status=400)

        # Vérification patient
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Patient non trouvé."}, status=404)

        # Vérification date
        try:
            date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({"status": "error", "message": "Date invalide. Format attendu : AAAA-MM-JJ"}, status=400)

        # Création de l’image radiologique
        image = ImageRadiologique.objects.create(
            patient=patient,
            path=path,
            date=date,
            modalite=modalite
        )

        return JsonResponse({
            "status": "success",
            "message": "Image radiologique ajoutée avec succès.",
            "image": {
                "id": image.id,
                "patient_id": patient.id,
                "modalite": image.modalite,
                "date": image.date.strftime('%Y-%m-%d'),
                "path": image.path
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Format JSON invalide."}, status=400)

    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur inattendue : {str(e)}"}, status=500)
