from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password
from APPI.models import ChefService, Role
import json
import datetime
from APPI.models.Role import required_role


@required_role(Role.ADMIN)
@csrf_exempt
@require_http_methods(["POST"])
def ajouter_chefService(request):
    try:
        data = json.loads(request.body)

        nom = data.get('nom')
        prenom = data.get('prenom')
        email = data.get('email')
        password = data.get('password')
        phonenumber = data.get('phonenumber', 'Numéro inconnu')
        adresse = data.get('adresse', 'Adresse inconnue')
        date_naissance_str = data.get('date_naissance', '2000-01-01')
        roles = data.get('roles', [])  # Liste des rôles

        if not nom or not prenom or not email or not password:
            return JsonResponse({"status": "error", "message": "Champs obligatoires manquants."}, status=400)

        if ChefService.objects.filter(email=email).exists():
            return JsonResponse({"status": "error", "message": "Email déjà utilisé."}, status=400)

        try:
            date_naissance = datetime.datetime.strptime(date_naissance_str, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({"status": "error", "message": "Date invalide. Format attendu : AAAA-MM-JJ"}, status=400)

        password_hache = make_password(password)

        # Création du chef de service
        chef = ChefService(
            nom=nom,
            prenom=prenom,
            email=email,
            password=password_hache,
            phonenumber=phonenumber,
            adresse=adresse,
            date_naissance=date_naissance
        )
        chef.save()

        # Ajout des rôles
        erreurs_roles = []
        for role_titre in roles:
            try:
                role = Role.objects.get(titre=role_titre)
                chef.roles.add(role)
            except Role.DoesNotExist:
                erreurs_roles.append(role_titre)

        if erreurs_roles:
            return JsonResponse({
                "status": "failed",
                "message": f"Les rôles suivants n'existent pas : {', '.join(erreurs_roles)}",
            }, status=400)

        return JsonResponse({
            "status": "success",
            "message": "Chef de service ajouté avec succès et rôles attribués.",
        }, status=201)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
