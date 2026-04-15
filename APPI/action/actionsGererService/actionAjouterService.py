from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.models import Service
import json
from APPI.models.Role import required_role, Role

@csrf_exempt
@required_role(Role.ADMIN)
def ajouter_service(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Vérifier les champs requis
            required_fields = ['nom', 'nom_hopital', 'adresse']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return JsonResponse({"status": "error", "message": f"Champs manquants: {', '.join(missing_fields)}"}, status=400)

            # Création du nouveau Service
            modalites = data.get('modalites', ['xray'])
            organes = data.get('organes', ['autre'])
            ai_models = data.get('ai_models', ['none'])

            service = Service.objects.create(
                nom=data['nom'],
                nom_hopital=data['nom_hopital'],
                adresse=data['adresse'],
                modalites=','.join(modalites) if isinstance(modalites, list) else modalites,
                organes=','.join(organes) if isinstance(organes, list) else organes,
                ai_models=','.join(ai_models) if isinstance(ai_models, list) else ai_models,
            )

            return JsonResponse({
                "status": "success",
                "message": "Service créé avec succès",
                "service": {
                    "id": service.id,
                    "nom": service.nom,
                    "nom_hopital": service.nom_hopital,
                    "adresse": service.adresse,
                    "modalites": service.get_modalites_list(),
                    "organes": service.get_organes_list(),
                    "ai_models": service.get_ai_models_list(),
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Requête JSON invalide"}, status=400)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Méthode non autorisée"}, status=405)
