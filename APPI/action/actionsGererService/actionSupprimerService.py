from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from APPI.models import Service
from APPI.models.Role import required_role, Role

@csrf_exempt
@require_POST
@required_role(Role.ADMIN)
def supprimer_service(request):
    try:
        data = json.loads(request.body)
        service_id = data.get('id')

        if not service_id:
            return JsonResponse({"status": "error", "message": "ID du service manquant."}, status=400)

        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Service introuvable."}, status=404)

        service.delete()

        return JsonResponse({
            "status": "success",
            "message": f"Service avec l'ID {service_id} supprimé avec succès."
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Données JSON invalides."}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
