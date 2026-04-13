from django.http import JsonResponse
from APPI.models.Notification import Notification
from APPI.models.Role import require_any_role, Role

@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE, Role.ADMIN, Role.SECRETAIRE)
def get_notifications(request):
    notifications = Notification.objects.filter(destinataire=request.user).order_by('-date')
    return JsonResponse([
        {
            "id": n.id,
            "message": n.message,
            "lien": n.lien,
            "type": n.type,
            "lu": n.lu,
            "date": n.date.strftime("%Y-%m-%d %H:%M:%S")
        }
        for n in notifications
    ], safe=False)
