from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from APPI.models import RDV, Patient, Radiologue
from APPI.models.Role import Role, require_any_role
import json

@csrf_exempt
@require_any_role(Role.SECRETAIRE, Role.CHEF_SERVICE, Role.RADIOLOGUE)
@require_http_methods(["GET", "POST"])
def rdv_list(request):
    """
    Récupérer la liste des rendez-vous selon le rôle de l'utilisateur:
    - RADIOLOGUE: seulement ses propres rendez-vous
    - SECRETAIRE/CHEF_SERVICE: tous les rendez-vous
    """
    try:
        user = request.user

        # Get radiologue_id from query params or POST data
        radiologue_id = None
        if request.method == 'GET':
            radiologue_id = request.GET.get('radiologue_id')
        elif request.method == 'POST':
            try:
                data = json.loads(request.body)
                radiologue_id = data.get('radiologue_id')
            except json.JSONDecodeError:
                pass

        # Logic based on role
        if radiologue_id:
            rdvs = RDV.objects.select_related('patient', 'radiologue').filter(radiologue_id=radiologue_id)
        elif user.groups.filter(name=Role.RADIOLOGUE).exists():
            rdvs = RDV.objects.select_related('patient', 'radiologue').filter(radiologue_id=user.id)
        elif user.groups.filter(name__in=[Role.SECRETAIRE, Role.CHEF_SERVICE, Role.ADMIN]).exists():
            rdvs = RDV.objects.select_related('patient', 'radiologue').all()
        else:
            rdvs = RDV.objects.select_related('patient', 'radiologue').all()

        data = [
            {
                "id": rdv.id,
                "date": rdv.date.strftime("%Y-%m-%dT%H:%M:%S"),
                "lieu": rdv.lieu,
                "type": rdv.type,
                "status": rdv.status,
                "accepte": rdv.accepte,
                "patient": {
                    "id": rdv.patient.id,
                    "nom": rdv.patient.nom,
                    "prenom": rdv.patient.prenom
                },
                "radiologue": {
                    "id": rdv.radiologue.id,
                    "nom": rdv.radiologue.nom,
                    "prenom": rdv.radiologue.prenom
                }
            }
            for rdv in rdvs
        ]
        return JsonResponse({"rdvs": data}, status=200)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur serveur: {str(e)}"}, status=500)
