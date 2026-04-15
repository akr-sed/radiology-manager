from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.models import Service
from rest_framework.decorators import api_view
import json
from APPI.models.Role import required_role, Role

@csrf_exempt
@api_view(['POST'])  # Cette vue ne répond qu'aux requêtes POST
@required_role(Role.ADMIN)
def modifier_service(request):
    try:
        data = json.loads(request.body)

        service_id = data.get('id')
        if not service_id:
            return JsonResponse({"status": "error", "message": "ID du service manquant."}, status=400)

        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Service introuvable."}, status=404)

        # Mise à jour des champs du service avec les données fournies
        service.nom = data.get('nom', service.nom)
        service.nom_hopital = data.get('nom_hopital', service.nom_hopital)
        service.adresse = data.get('adresse', service.adresse)

        if 'modalites' in data:
            modalites = data['modalites']
            service.modalites = ','.join(modalites) if isinstance(modalites, list) else modalites
        if 'organes' in data:
            organes = data['organes']
            service.organes = ','.join(organes) if isinstance(organes, list) else organes
        if 'ai_models' in data:
            ai_models = data['ai_models']
            service.ai_models = ','.join(ai_models) if isinstance(ai_models, list) else ai_models

        # Sauvegarde des modifications
        service.save()

        return JsonResponse({
            "status": "success",
            "message": f"Service '{service.nom}' modifié avec succès."
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Données invalides."}, status=400)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
