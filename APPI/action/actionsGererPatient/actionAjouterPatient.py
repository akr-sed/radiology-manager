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

    # Check if user is a radiologue (by role group or by Radiologue instance)
    is_radiologue = user.groups.filter(name=Role.RADIOLOGUE).exists() or hasattr(user, 'radiologue')

    if is_radiologue:
        # Resolve the Radiologue instance (create one if missing so the FK works)
        try:
            radiologue = user.radiologue if hasattr(user, 'radiologue') else Radiologue.objects.get(pk=user.pk)
        except Radiologue.DoesNotExist:
            radiologue = Radiologue(compte_ptr_id=user.pk)
            radiologue.__dict__.update(user.__dict__)
            radiologue.save_base(raw=True)
        patient.radiologue = radiologue
    else:
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