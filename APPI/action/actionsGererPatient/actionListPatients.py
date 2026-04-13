from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from APPI.models import Patient
from APPI.models.Role import require_any_role, Role
from APPI.models.Radiologue import Radiologue
from APPI.models.ChefService import ChefService

@csrf_exempt
@api_view(['GET'])
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE) 
def patient_list(request):
    try:
        user = request.user
        
        # Cas 1: Si l'utilisateur est un Radiologue, ne montrer que ses patients
        if hasattr(user, 'radiologue'):
            radiologue = user.radiologue
            patients = Patient.objects.filter(radiologue=radiologue)
        
        # Cas 2: Si l'utilisateur est un Chef de Service, montrer tous les patients
        elif hasattr(user, 'chefservice'):
            patients = Patient.objects.all()
            
        # Cas 3: Si l'utilisateur est un Secrétaire, montrer tous les patients
        else:
            patients = Patient.objects.all()

        patients_data = [{
            "id": p.id,
            "nom": p.nom,
            "prenom": p.prenom,
            "email": p.email,
            "phonenumber": p.phonenumber,
            "adresse": p.adresse,
            "date_naissance": p.date_naissance.strftime('%Y-%m-%d'),
        } for p in patients]

        return JsonResponse({"status": "success", "patients": patients_data}, status=200)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)