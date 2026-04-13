# Imports Django
from ultralytics import YOLO
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.iamodel import yolo_model,yolo_IRM_model,yolo_MAMO_model
# Décorateurs DRF et sécurité
from rest_framework.decorators import api_view
from APPI.decorators_token import token_required
import os
from django.http import JsonResponse
import json
from APPI.models.Role import require_any_role, Role

#
@token_required
@api_view(['POST'])
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE)
def performe_ia_eco(request):
    try:
        data = json.loads(request.body)
        eco_path = data.get("path")
       
        results=[]
        # Faire la prédiction
        if "ECO" in eco_path:
            results = yolo_model(eco_path)
           
        elif "IRM" in eco_path:
            results = yolo_IRM_model(eco_path)
           
        elif 'MAMO' in eco_path:
            results = yolo_MAMO_model(eco_path)
        
        all_boxes = []
        
# Séparer le chemin de base et l'extension
        base, extension = os.path.splitext(eco_path)
       
# Construire le nouveau chemin
        path_save = base + '_IA' + extension
        
        for r in results[0]:
            # r.boxes.xyxy : tensor de shape (num_boxes, 4)
            boxes = r.boxes.data.cpu().numpy().tolist()  # Convertir en liste python
            all_boxes.append(boxes)
            results[0].save(path_save)
       
        return JsonResponse({
            "status": "success",
            "boxes": all_boxes  # liste de liste(s)
        }, status=200)

    
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
