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
            service = Service.objects.create(
                nom=data['nom'],
                nom_hopital=data['nom_hopital'],
                adresse=data['adresse'],
                modalite=data.get('modalite', 'xray'),
                organe=data.get('organe', 'autre'),
                ai_model=data.get('ai_model', 'none'),
            )

            return JsonResponse({
                "status": "success",
                "message": "Service créé avec succès",
                "service": {
                    "id": service.id,
                    "nom": service.nom,
                    "nom_hopital": service.nom_hopital,
                    "adresse": service.adresse,
                    "modalite": service.modalite,
                    "organe": service.organe,
                    "ai_model": service.ai_model,
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Requête JSON invalide"}, status=400)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Méthode non autorisée"}, status=405)
