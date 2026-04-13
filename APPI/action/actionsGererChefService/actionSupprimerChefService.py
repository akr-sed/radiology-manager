from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from APPI.models import ChefService
import json
from APPI.models.Role import required_role, Role


@required_role(Role.ADMIN)
@csrf_exempt
@require_http_methods(["POST"])
def supprimer_chef_service(request):
    try:
        data = json.loads(request.body)
        chef_id = data.get('id')

        if not chef_id:
            return JsonResponse({"status": "error", "message": "L'id du Chef de service est requis."}, status=400)

        try:
            chef_service = ChefService.objects.get(id=chef_id)
            chef_service.delete()
            return JsonResponse({"status": "success", "message": "Chef de service supprimé avec succès."}, status=200)

        except ChefService.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Chef de service non trouvé."}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Format de la requête JSON invalide."}, status=400)
