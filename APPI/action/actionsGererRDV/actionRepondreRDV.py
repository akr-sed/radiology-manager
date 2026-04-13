from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from APPI.models import RDV, Radiologue, Notification
from APPI.models.Role import Role, require_any_role
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@csrf_exempt
@require_any_role(Role.RADIOLOGUE)
@require_http_methods(["POST"])
def repondre_rdv(request, rdv_id):
    """
    Permettre au radiologue de répondre à une demande de RDV (accepter ou refuser)
    """
    user = request.user

    if not user.groups.filter(name=Role.RADIOLOGUE).exists():
        return JsonResponse({
            "status": "error",
            "message": "Seuls les radiologues peuvent répondre aux demandes de RDV"
        }, status=403)

    try:
        data = json.loads(request.body)
        accepte = data.get('accepte', False)

        rdv = get_object_or_404(RDV, id=rdv_id)

        # Vérifier que le radiologue associé au RDV est bien l'utilisateur connecté
        try:
            radiologue = Radiologue.objects.get(compte=user)
            if rdv.radiologue.id != radiologue.id:
                return JsonResponse({
                    "status": "error",
                    "message": "Vous n'êtes pas autorisé à répondre à ce RDV"
                }, status=403)
        except Radiologue.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Utilisateur non associé à un radiologue"
            }, status=403)

        rdv.accepte = accepte
        rdv.status = "Confirmé" if accepte else "Refusé"
        rdv.save()

        # Notifier le créateur du RDV si possible
        if rdv.created_by:
            message = f"Le radiologue {radiologue.nom} a {'accepté' if accepte else 'refusé'} le RDV avec {rdv.patient.nom} prévu le {rdv.date.strftime('%d/%m/%Y à %H:%M')}"

            notification = Notification.objects.create(
                recipient=rdv.created_by,
                rdv=rdv,
                message=message,
                type="appointment_response"
            )

            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_{rdv.created_by.id}",
                    {
                        "type": "send_notification",
                        "message": message,
                        "type_notification": "appointment_response",
                        "rdv_id": rdv.id,
                        "notification_id": notification.id,
                        "patient_id": rdv.patient.id
                    }
                )
            except Exception as e:
                print(f"WebSocket notification error: {str(e)}")

        return JsonResponse({
            "status": "success",
            "message": f"Rendez-vous {'accepté' if accepte else 'refusé'} avec succès"
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Données JSON invalides"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur serveur: {str(e)}"}, status=500)
