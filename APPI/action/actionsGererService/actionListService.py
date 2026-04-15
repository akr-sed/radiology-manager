from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from APPI.models import Service
from APPI.models.Role import required_role, Role

@csrf_exempt
@required_role(Role.ADMIN)
@api_view(['GET'])
def service_list(request):
    try:
        # Récupérer tous les services
        services = Service.objects.all()

        services_data = [{
            "id": service.id,
            "nom": service.nom,
            "nom_hopital": service.nom_hopital,
            "adresse": service.adresse,
            "modalites": service.get_modalites_list(),
            "modalites_display": service.get_modalites_display(),
            "organes": service.get_organes_list(),
            "organes_display": service.get_organes_display(),
            "ai_models": service.get_ai_models_list(),
            "ai_models_display": service.get_ai_models_display(),
        } for service in services]

        return JsonResponse({"status": "success", "services": services_data}, status=200)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
