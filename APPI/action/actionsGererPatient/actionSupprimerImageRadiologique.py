from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from APPI.models import ImageRadiologique
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json
import os
@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Vérifie que l'utilisateur est authentifié
def suprimer_image(request):
    try:
        # Vérifiez si le patient existe
        try:
            data = json.loads(request.body)
            image_id = data.get('id')
            image = ImageRadiologique.objects.get(id=image_id)
        except ImageRadiologique.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Patient introuvable."}, status=404)

        # Supprimez l'image radiologique
       

        file_path =  image.path
        print(file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
        image.delete()
        
        return JsonResponse({
            "status": "success",
            "message": f"Patient avec l'ID {image_id} supprimé avec succès."
        }, status=200)

    except Exception as e:
        # Gestion des erreurs inattendues
        return JsonResponse({"status": "error", "message": f"Erreur serveur : {str(e)}"}, status=500)