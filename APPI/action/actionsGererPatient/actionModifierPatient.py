from django.http import JsonResponse
from APPI.models import Patient
import json
import datetime
from APPI.models.Role import require_any_role, Role
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE)
def modifier_patient(request, id):
    print("====== MODIFIER PATIENT ======")
    print("Utilisateur:", request.user)
    print("Est authentifié:", request.user.is_authenticated)
    print("Groupes:", [g.name for g in request.user.groups.all()])
    print("Authorization header:", request.headers.get('Authorization'))
    try:
        print(f"Utilisateur connecté : {request.user}")
        print(f"Rôles de l'utilisateur : {[group.name for group in request.user.groups.all()]}")

        try:
            patient = Patient.objects.get(id=id)
        except Patient.DoesNotExist:
            print("Erreur : Patient introuvable.")
            return JsonResponse({"status": "error", "message": "Patient introuvable."}, status=404)

        if request.method == 'GET':
            print("Requête GET reçue pour récupérer les données du patient.")
            return JsonResponse({
                "id": patient.id,
                "nom": patient.nom,
                "prenom": patient.prenom,
                "email": patient.email,
                "phonenumber": patient.phonenumber,
                "adresse": patient.adresse,
                "date_naissance": patient.date_naissance.isoformat() if patient.date_naissance else None,
            })

        elif request.method == 'PUT':
            print("Requête PUT reçue pour modifier les données du patient.")
            data = json.loads(request.body)
            print(f"Données reçues : {data}")

            patient.nom = data.get('nom', patient.nom)
            patient.prenom = data.get('prenom', patient.prenom)
            patient.email = data.get('email', patient.email)
            patient.phonenumber = data.get('phonenumber', patient.phonenumber)
            patient.adresse = data.get('adresse', patient.adresse)

            if 'date_naissance' in data:
                try:
                    patient.date_naissance = datetime.datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
                except ValueError:
                    print("Erreur : Date invalide.")
                    return JsonResponse({"status": "error", "message": "Date invalide. Format attendu : AAAA-MM-JJ"}, status=400)

            patient.save()
            print(f"Patient {patient.nom} {patient.prenom} modifié avec succès.")
            return JsonResponse({
                "status": "success",
                "message": f"Patient {patient.nom} {patient.prenom} modifié avec succès."
            }, status=200)

    except Exception as e:
        print(f"Erreur interne : {str(e)}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
