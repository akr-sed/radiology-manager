from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from APPI.models import RDV
from APPI.models.Role import Role, require_any_role

@csrf_exempt
@require_any_role(Role.SECRETAIRE, Role.CHEF_SERVICE, Role.RADIOLOGUE)
@require_http_methods(["DELETE"])
def supprimer_rdv(request, rdv_id):
    """
    Supprimer un rendez-vous existant.
    - CHEF_SERVICE/SECRETAIRE: peut supprimer n'importe quel RDV
    - RADIOLOGUE: ne peut supprimer que ses propres RDV
    """
    try:
        user = request.user
        rdv = get_object_or_404(RDV, id=rdv_id)

        if user.groups.filter(name__in=[Role.SECRETAIRE, Role.CHEF_SERVICE, Role.ADMIN]).exists():
            pass  # Can delete any RDV
        elif user.groups.filter(name=Role.RADIOLOGUE).exists():
            is_own_rdv = hasattr(user, 'radiologue') and rdv.radiologue.id == user.radiologue.id
            if not is_own_rdv:
                return JsonResponse({
                    "status": "error",
                    "message": "Vous n'êtes pas autorisé à supprimer ce rendez-vous"
                }, status=403)
        else:
            return JsonResponse({
                "status": "error",
                "message": "Vous n'avez pas les permissions requises"
            }, status=403)

        rdv.delete()

        return JsonResponse({
            "status": "success",
            "message": "Rendez-vous supprimé avec succès"
        }, status=200)

    except RDV.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Rendez-vous non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur serveur: {str(e)}"}, status=500)
