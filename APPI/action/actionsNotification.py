from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from APPI.models import Notification, Radiologue, Patient
from APPI.models.Role import Role, require_any_role
from APPI.models.compte import Compte
import json
import traceback
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def envoyer_notification(radiologue_id, message, type_notification='appointment', patient=None, rdv=None):
    """
    Envoie une notification à un radiologue
    """
    try:
        if len(message) > 255:
            message = message[:252] + "..."

        radiologue = get_object_or_404(Radiologue, id=radiologue_id)

        notification = Notification.objects.create(
            radiologue=radiologue,
            recipient=radiologue.compte if hasattr(radiologue, 'compte') else None,
            message=message,
            type=type_notification,
            patient=patient,
            rdv=rdv,
            lu=False,
            read=False,
        )

        if hasattr(radiologue, 'compte') and radiologue.compte:
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_{radiologue.compte.id}",
                    {
                        "type": "send_notification",
                        "message": message,
                        "type_notification": type_notification,
                        "patient_id": patient.id if patient else None,
                        "rdv_id": rdv.id if rdv else None,
                        "notification_id": notification.id
                    }
                )
            except Exception as e:
                print(f"Erreur WebSocket: {str(e)}")

        return notification
    except Radiologue.DoesNotExist:
        print(f"Erreur : Radiologue avec ID {radiologue_id} non trouvé")
        return None
    except Exception as e:
        print(f"Erreur lors de l'envoi de la notification : {str(e)}")
        print(traceback.format_exc())
        return None

@csrf_exempt
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE, Role.SECRETAIRE)
@require_http_methods(["GET"])
def get_notifications(request):
    """
    Récupérer les notifications de l'utilisateur connecté
    """
    try:
        user = request.user

        notifications = []
        try:
            if hasattr(Notification, 'recipient'):
                notifications = Notification.objects.filter(recipient=user).order_by('-created_at')[:20]
            elif hasattr(Notification, 'destinataire'):
                notifications = Notification.objects.filter(destinataire=user).order_by('-date_creation')[:20]
            else:
                try:
                    radiologue = Radiologue.objects.get(compte=user)
                    notifications = Notification.objects.filter(radiologue=radiologue).order_by('-created_at')[:20]
                except Radiologue.DoesNotExist:
                    pass
        except Exception as e:
            print(f"Erreur lors de la récupération des notifications: {str(e)}")

        notifications_data = []
        for notif in notifications:
            try:
                notif_data = {
                    "id": notif.id,
                    "message": notif.message,
                    "lu": False,
                    "type": getattr(notif, 'type', 'info'),
                }

                if hasattr(notif, 'created_at'):
                    notif_data["date_creation"] = notif.created_at.isoformat()
                elif hasattr(notif, 'date_creation'):
                    notif_data["date_creation"] = notif.date_creation.isoformat()
                else:
                    notif_data["date_creation"] = ""

                if hasattr(notif, 'read'):
                    notif_data["lu"] = notif.read
                elif hasattr(notif, 'lu'):
                    notif_data["lu"] = notif.lu

                if hasattr(notif, 'rdv') and notif.rdv:
                    notif_data["rdv_id"] = notif.rdv.id
                if hasattr(notif, 'patient') and notif.patient:
                    notif_data["patient_id"] = notif.patient.id

                notifications_data.append(notif_data)
            except Exception as e:
                print(f"Erreur formatage notification {notif.id}: {str(e)}")
                continue

        return JsonResponse({
            "status": "success",
            "notifications": notifications_data
        })

    except Exception as e:
        print(f"Erreur dans get_notifications: {str(e)}")
        return JsonResponse({
            "status": "success",
            "notifications": []
        })

@csrf_exempt
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE, Role.SECRETAIRE)
@require_http_methods(["POST"])
def marquer_lu(request, notif_id):
    """
    Marquer une notification comme lue
    """
    try:
        user = request.user

        try:
            if hasattr(Notification, 'recipient'):
                notification = Notification.objects.get(id=notif_id, recipient=user)
            elif hasattr(Notification, 'destinataire'):
                notification = Notification.objects.get(id=notif_id, destinataire=user)
            else:
                radiologue = Radiologue.objects.get(compte=user)
                notification = Notification.objects.get(id=notif_id, radiologue=radiologue)

            if hasattr(notification, 'read'):
                notification.read = True
            if hasattr(notification, 'lu'):
                notification.lu = True

            notification.save()

            return JsonResponse({
                "status": "success",
                "message": "Notification marquée comme lue"
            })
        except (Notification.DoesNotExist, Radiologue.DoesNotExist):
            return JsonResponse({
                "status": "error",
                "message": "Notification non trouvée"
            }, status=404)

    except Exception as e:
        print(f"Erreur dans marquer_lu: {str(e)}")
        return JsonResponse({
            "status": "error",
            "message": "Une erreur est survenue",
            "error": str(e)
        }, status=500)
