from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from APPI.models.Notification import Notification
from django.db.models import Q

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """
    Vérifie si le token est valide.
    """
    user = request.user
    return Response({
        "status": "success",
        "user": {
            "id": user.id,
            "nom": user.last_name,
            "prenom": user.first_name,
            "is_chef_service": user.groups.filter(name="ChefService").exists()
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).order_by('-created_at')
    
    return Response({
        'notifications': [{
            'id': n.id,
            'message': n.message,
            'created_at': n.created_at,
            'rdv_id': n.rdv.id
        } for n in notifications]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification non trouvée'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True)
    return Response({'status': 'success'})