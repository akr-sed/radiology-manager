import json
import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from APPI.models import ChefService, Role
from APPI.models.Role import required_role


@required_role(Role.ADMIN)
@csrf_exempt
@require_http_methods(["POST"])

def modifier_chefService(request):
    try:
        data = json.loads(request.body)

        chef_id = data.get('id')
        if not chef_id:
            return JsonResponse({"status": "error", "message": "ID du Chef de service manquant."}, status=400)

        try:
            chef = ChefService.objects.get(id=chef_id)
        except ChefService.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Chef de service introuvable."}, status=404)

        # Mise à jour des champs
        chef.nom = data.get('nom', chef.nom)
        chef.prenom = data.get('prenom', chef.prenom)
        chef.email = data.get('email', chef.email)
        chef.phonenumber = data.get('phonenumber', chef.phonenumber)
        chef.adresse = data.get('adresse', chef.adresse)

        date_naissance_str = data.get('date_naissance')
        if date_naissance_str:
            try:
                chef.date_naissance = datetime.datetime.strptime(date_naissance_str, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse({"status": "error", "message": "Format de date invalide. Utilisez AAAA-MM-JJ."}, status=400)

        # Mise à jour des rôles
        roles = data.get('roles')
        if roles is not None:
            chef.roles.clear()
            erreurs_roles = []
            for titre in roles:
                try:
                    role = Role.objects.get(titre=titre)
                    chef.roles.add(role)
                except Role.DoesNotExist:
                    erreurs_roles.append(titre)
            if erreurs_roles:
                return JsonResponse({
                    "status": "error",
                    "message": f"Les rôles suivants n'existent pas : {', '.join(erreurs_roles)}"
                }, status=400)

        chef.save()

        return JsonResponse({"status": "success", "message": "Chef de service modifié avec succès."}, status=200)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
