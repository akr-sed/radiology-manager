from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from APPI.models import Radiologue
from APPI.models.Role import require_any_role, Role
import logging
import json
from django.conf import settings

# Configurer le logger
logger = logging.getLogger(__name__)

@csrf_exempt
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE, Role.SECRETAIRE)
@require_http_methods(["GET"])
def list_radiologues(request):
    """
    Retrieve the list of all radiologists.
    """
    try:

        # Récupérer tous les radiologues
        radiologues_query = Radiologue.objects.all()

        # Vérifier si la requête a retourné des données
        if not radiologues_query.exists():
            logger.warning("Aucun radiologue trouvé dans la base de données")
            return JsonResponse({"status": "success", "radiologues": [], "message": "Aucun radiologue trouvé."}, status=200)

        # Liste pour stocker les données formatées
        radiologues_data = []

        for radiologue in radiologues_query:
            radiologue_data = {
                "id": radiologue.id,
                "nom": radiologue.nom or "Non spécifié",
                "prenom": radiologue.prenom or "Non spécifié",
                "email": radiologue.email or "Non spécifié",
                "phonenumber": radiologue.phonenumber or "Non spécifié",
                "adresse": radiologue.adresse or "Non spécifiée",
                "date_naissance": radiologue.date_naissance.strftime('%Y-%m-%d') if radiologue.date_naissance else "Non spécifiée",
            }

            radiologues_data.append(radiologue_data)

        return JsonResponse({"status": "success", "radiologues": radiologues_data}, status=200)

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des radiologues: {str(e)}")
        return JsonResponse({"status": "error", "message": f"Erreur serveur: {str(e)}"}, status=500)


