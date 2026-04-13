from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from APPI.models import Radiologue
from APPI.models.Role import Role, is_chef_service, is_admin
import logging
import traceback
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_radiologue(request, radiologue_id):
    try:
        # Vérification du rôle en utilisant la fonction utilitaire
        if not (is_chef_service(request.user) or is_admin(request.user)):
            logger.warning(f"Tentative d'accès non autorisé: Utilisateur {request.user.email}, Groupes: {[g.name for g in request.user.groups.all()]}")
            return JsonResponse({
                "status": "error", 
                "message": "Accès refusé. Vous n'avez pas les droits nécessaires."
            }, status=403)
        
        # Debug log
        logger.debug(f"Tentative de suppression du radiologue ID: {radiologue_id}")
        
        try:
            radiologue = Radiologue.objects.get(id=radiologue_id)
        except Radiologue.DoesNotExist:
            logger.warning(f"Radiologue ID {radiologue_id} non trouvé")
            return JsonResponse({
                "status": "error", 
                "message": f"Radiologue avec l'ID {radiologue_id} non trouvé"
            }, status=404)
        
        # Suppression effective
        radiologue.delete()
        
        logger.info(f"Radiologue supprimé avec succès: {radiologue.nom} {radiologue.prenom} (ID: {radiologue_id})")
        
        return JsonResponse({
            "status": "success",
            "message": f"Radiologue supprimé avec succès",
            "deleted_id": radiologue_id
        }, status=200)
    
    except Exception as e:
        error_detail = traceback.format_exc()
        logger.error(f"Erreur suppression radiologue {radiologue_id}: {str(e)}\n{error_detail}")
        
        return JsonResponse({
            "status": "error",
            "message": f"Erreur lors de la suppression: {str(e)}"
        }, status=500)