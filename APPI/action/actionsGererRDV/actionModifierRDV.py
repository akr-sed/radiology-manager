from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from APPI.models import RDV, Patient, Radiologue
from APPI.models.Role import Role, require_any_role
import json
from datetime import datetime

@csrf_exempt
@require_any_role(Role.SECRETAIRE, Role.CHEF_SERVICE, Role.RADIOLOGUE)
@require_http_methods(["POST", "PUT"])
def modifier_rdv(request, rdv_id):
    """
    Modifier un rendez-vous existant.
    - CHEF_SERVICE/SECRETAIRE: peut modifier n'importe quel RDV
    - RADIOLOGUE: ne peut modifier que ses propres RDV
    """
    try:
        user = request.user
        data = json.loads(request.body)

        rdv = get_object_or_404(RDV, id=rdv_id)

        # Authorization check
        if user.groups.filter(name=Role.RADIOLOGUE).exists():
            if hasattr(user, 'radiologue') and rdv.radiologue.id != user.radiologue.id:
                return JsonResponse({
                    "status": "error",
                    "message": "Vous n'êtes pas autorisé à modifier ce rendez-vous"
                }, status=403)
        elif not user.groups.filter(name__in=[Role.SECRETAIRE, Role.CHEF_SERVICE, Role.ADMIN]).exists() and not user.is_superuser:
            return JsonResponse({
                "status": "error",
                "message": "Vous n'avez pas les permissions requises"
            }, status=403)

        if 'patient_id' in data:
            patient = get_object_or_404(Patient, id=data['patient_id'])
            rdv.patient = patient

        if 'radiologue_id' in data:
            radiologue = get_object_or_404(Radiologue, id=data['radiologue_id'])
            rdv.radiologue = radiologue

        if 'date' in data:
            try:
                date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except ValueError:
                try:
                    date = datetime.strptime(data['date'], "%Y-%m-%dT%H:%M:%S")
                except ValueError:
                    return JsonResponse({
                        "status": "error",
                        "message": "Format de date invalide. Utilisez le format ISO (YYYY-MM-DDTHH:MM:SS)."
                    }, status=400)
            rdv.date = date

        if 'lieu' in data:
            rdv.lieu = data['lieu']
        if 'type' in data:
            rdv.type = data['type']
        if 'status' in data:
            rdv.status = data['status']
        if 'accepte' in data:
            rdv.accepte = data['accepte']

        rdv.save()

        return JsonResponse({
            "status": "success",
            "message": "Rendez-vous modifié avec succès"
        }, status=200)

    except Patient.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Patient non trouvé"}, status=404)
    except Radiologue.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Radiologue non trouvé"}, status=404)
    except RDV.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Rendez-vous non trouvé"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Données JSON invalides"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur serveur: {str(e)}"}, status=500)
