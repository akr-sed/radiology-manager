from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status

from APPI.decorators_token import token_required
from APPI.models.Role import require_any_role, Role

from APPI.models.ImageRadiologique import ImageRadiologique
import os
import json
from django.conf import settings


@csrf_exempt
@token_required
@api_view(['GET'])
@require_any_role(Role.RADIOLOGUE, Role.CHEF_SERVICE)
def loadAnnotation(request):
    """
    Charge les annotations d'une image radiologique et retourne :
    {
        "status": "success",
        "boxes": [
            [ [x1, y1, x2, y2], ... ]
        ]
    }
    """
    try:
        image_id = request.GET.get('image_id')
        if not image_id:
            return JsonResponse({
                "status": "error",
                "message": "Paramètre 'image_id' requis."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = ImageRadiologique.objects.get(id=image_id)
        except ImageRadiologique.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": f"Aucune image trouvée pour l'ID '{image_id}'."
            }, status=status.HTTP_404_NOT_FOUND)

        # Chemin JSON
        rel_path = image.path  # relatif à MEDIA_ROOT
        image_name_wo_ext = os.path.splitext(rel_path)[0]
    
        json_path = f'{settings.BASE_DIR}/{image_name_wo_ext}.json'
        print(json_path)
        if not os.path.isfile(json_path):
            return JsonResponse({
                "status": "success",
                "boxes": [[]]  # Format exact attendu : liste vide dans une liste
            }, status=status.HTTP_200_OK)

        with open(json_path, "r") as f:
            annotations = json.load(f)

        # Construire la liste [ [ [x1, y1, x2, y2], ... ] ]
        boxes = []
        etiquetes=[]
        for ann in annotations:
            x1 = ann.get("x")
            y1 = ann.get("y")
            x2 = x1 + ann.get("largeur", 0)
            y2 = y1 + ann.get("hauteur", 0)
            etiquetes.append(ann.get("etiquette"))
            
            boxes.append([x1, y1, x2, y2])
        print(etiquetes)
        print(boxes)
        return JsonResponse({
            "status": "success",
            "boxes": [boxes],  # Format : liste dans une liste
            "etiq":[etiquetes],
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Erreur serveur : {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
