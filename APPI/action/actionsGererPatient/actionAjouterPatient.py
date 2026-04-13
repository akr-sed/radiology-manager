from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.models import Patient, Radiologue
from rest_framework.decorators import api_view
import json
import datetime
from APPI.models.Role import require_any_role, Role

@csrf_exempt
@api_view(['POST'])
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE) 
def ajouter_patient(request):
    user = request.user

    try:
        data = json.loads(request.body)
        nom = data.get('nom')
        prenom = data.get('prenom', 'Prénom inconnu')
        email = data.get('email')
        phonenumber = data.get('phonenumber', 'Numéro inconnu')
        adresse = data.get('adresse', 'Adresse inconnue')
        date_naissance_str = data.get('date_naissance', '2000-01-01')

        if not nom or not email:
            return JsonResponse({"status": "error", "message": "Champs obligatoires manquants (nom, email)."}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Requête JSON invalide"}, status=400)

    try:
        date_naissance = datetime.datetime.strptime(date_naissance_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({"status": "error", "message": "Date invalide. Format attendu : AAAA-MM-JJ"}, status=400)

    patient = Patient(
        nom=nom,
        prenom=prenom,
        email=email,
        phonenumber=phonenumber,
        adresse=adresse,
        date_naissance=date_naissance
    )

    # Si l'utilisateur est un radiologue, assignez directement ce radiologue au patient
    if hasattr(user, 'radiologue'):
        patient.radiologue = user.radiologue
    else:
        # Si l'utilisateur n'est pas un radiologue (chef de service ou secrétaire),
        # utilisez le radiologue_id fourni dans la requête
        radiologue_id = data.get('radiologue_id')
        if not radiologue_id:
            return JsonResponse({"status": "error", "message": "Radiologue ID manquant."}, status=400)

        try:
            radiologue = Radiologue.objects.get(id=radiologue_id)
            patient.radiologue = radiologue
        except Radiologue.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Radiologue non trouvé."}, status=404)

    patient.save()

    return JsonResponse({
        "status": "success",
        "message": "Patient ajouté avec succès.",
        "patient_id": patient.id,
        "assigned_radiologue": patient.radiologue.id
    }, status=201)