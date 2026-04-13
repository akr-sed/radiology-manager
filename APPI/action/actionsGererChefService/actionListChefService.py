from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from APPI.models import ChefService
from APPI.models.Role import required_role, Role
from django.views.decorators.http import require_http_methods

@required_role(Role.ADMIN)
@csrf_exempt
@require_http_methods(["GET"])
def list_chef_service(request):
    try:
        # Récupérer tous les chefs de service
        chefs = ChefService.objects.all()

        chefs_data = [{
            "id": c.id,
            "nom": c.nom,
            "prenom": c.prenom,
            "email": c.email,
            "phonenumber": c.phonenumber,
            "adresse": c.adresse,
            "date_naissance": c.date_naissance.strftime('%Y-%m-%d') if c.date_naissance else None,
        } for c in chefs]

        return JsonResponse({"status": "success", "chefs_service": chefs_data}, status=200)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
