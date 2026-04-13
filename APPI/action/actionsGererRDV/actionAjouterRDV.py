from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from APPI.models import RDV, Patient, Radiologue
from APPI.models.Role import Role, require_any_role
from APPI.action.actionsNotification import envoyer_notification

import json
from datetime import datetime

@csrf_exempt
@require_any_role(Role.SECRETAIRE, Role.CHEF_SERVICE, Role.RADIOLOGUE)
@require_http_methods(["POST"])
def ajouter_rdv(request):
    """
    Ajouter un nouveau rendez-vous.
    Permissions: SECRETAIRE, CHEF_SERVICE, RADIOLOGUE
    """
    user = request.user

    try:
        data = json.loads(request.body)
        patient_id = int(data.get('patient_id'))
        radiologue_id = int(data.get('radiologue_id'))
        date_str = data.get('date')
        lieu = data.get('lieu')
        type_rdv = data.get('type', 'Examen (mammographie)')
        status = data.get('status', 'Planifié')
        accepte = data.get('accepte', False)

        if not all([patient_id, radiologue_id, date_str, lieu]):
            return JsonResponse({"status": "error", "message": "Tous les champs sont obligatoires"}, status=400)

        patient = get_object_or_404(Patient, id=patient_id)
        radiologue = get_object_or_404(Radiologue, id=radiologue_id)

        try:
            date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except ValueError:
            try:
                date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S")
            except ValueError:
                return JsonResponse({
                    "status": "error",
                    "message": "Format de date invalide. Utilisez le format ISO (YYYY-MM-DDTHH:MM:SS)."
                }, status=400)

        # Vérifie si l'utilisateur connecté est le radiologue concerné
        is_radiologue_user = user.groups.filter(name=Role.RADIOLOGUE).exists() and \
                             hasattr(user, 'radiologue') and \
                             user.radiologue.id == radiologue.id

        if is_radiologue_user:
            accepte = True  # Auto-acceptation du RDV

        rdv = RDV.objects.create(
            patient=patient,
            radiologue=radiologue,
            date=date,
            lieu=lieu,
            type=type_rdv,
            status=status,
            accepte=accepte,
            created_by=user
        )

        if not is_radiologue_user:
            message = f"Un nouveau RDV est proposé pour le patient {patient.nom} le {date}."
            lien = f"/rdv/{rdv.id}/"
            if hasattr(radiologue, 'utilisateur'):
                envoyer_notification(radiologue.utilisateur.id, message, lien, type='appointment', related_rdv=rdv)

        return JsonResponse({
            "status": "success",
            "message": "Rendez-vous ajouté avec succès.",
            "rdv_id": rdv.id
        }, status=201)

    except Patient.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Patient non trouvé"}, status=404)
    except Radiologue.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Radiologue non trouvé"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Données JSON invalides"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur serveur: {str(e)}"}, status=500)
