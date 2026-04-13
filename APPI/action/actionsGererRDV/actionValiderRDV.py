from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from APPI.models import RDV, Radiologue, Role
from APPI.models.Role import require_any_role
from ..actionsNotification import envoyer_notification
import json

@csrf_exempt
@require_any_role(Role.RADIOLOGUE)
@require_http_methods(["POST"])
def valider_rdv(request, rdv_id):
    user = request.user

    if not user.groups.filter(name=Role.RADIOLOGUE).exists():
        return JsonResponse({"status": "error", "message": "Seul un radiologue peut valider un RDV"}, status=403)

    rdv = get_object_or_404(RDV, id=rdv_id)

    data = json.loads(request.body)
    accepte = data.get('accepte', False)

    rdv.accepte = accepte
    rdv.status = 'Confirmé' if accepte else 'Rejeté'
    rdv.save()

    # Notifier le créateur du RDV
    try:
        if rdv.created_by:
            chef_radiologue = get_object_or_404(Radiologue, utilisateur=rdv.created_by)
            message = f"Le RDV pour {rdv.patient.nom} le {rdv.date} a été {'confirmé' if accepte else 'rejeté'} par {rdv.radiologue.nom}."
            envoyer_notification(
                radiologue_id=chef_radiologue.id,
                message=message,
                type_notification='appointment',
                patient=rdv.patient
            )
    except Exception as e:
        print(f"Notification error: {str(e)}")

    return JsonResponse({
        "status": "success",
        "message": f"RDV {'confirmé' if accepte else 'rejeté'} avec succès."
    }, status=200)
