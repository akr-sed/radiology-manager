from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from APPI.models import Compte
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

@csrf_exempt
def login_utilisateur(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({"status": "error", "message": "Email et mot de passe requis."}, status=400)

            personne = Compte.objects.get(email=email)
           
            if not check_password(password, personne.password):
                print("Erreur",personne)
                return JsonResponse({"status": "error", "message": "Mot de passe incorrect."}, status=401)

            # 🔥 Ajout de l'utilisateur dans ses groupes, avec vérification stricte
            for role in personne.roles.all():
                try:
                    print(role.titre)
                    group = Group.objects.get(name=role.titre)
                    personne.groups.add(group)
                except Group.DoesNotExist:
                    return JsonResponse({
                        "status": "error",
                        "message": f"Le groupe correspondant au rôle '{role.titre}' n'existe pas."
                    }, status=500)

            # 🔥 Génération des tokens JWT
            refresh = RefreshToken.for_user(personne)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # ✅ Réponse JSON avec les infos du compte
            return JsonResponse({
                "status": "success",
                "message": "Connexion réussie",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": personne.id,
                    "nom": personne.nom,
                    "prenom": personne.prenom,
                    "email": personne.email,
                    "phonenumber": personne.phonenumber,
                    "adresse": personne.adresse,
                    "date_naissance": personne.date_naissance.strftime("%Y-%m-%d"),
                    "roles": list(personne.roles.values_list('titre', flat=True))
                }
            })

        except Compte.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Utilisateur introuvable."}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Requête JSON invalide."}, status=400)

        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Erreur inattendue: {str(e)}"}, status=500)

    return JsonResponse({"status": "error", "message": "Méthode non autorisée."}, status=405)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    user = request.user  # Ce sera un objet Compte si tout est bien configuré
    return Response({
        'status': 'success',
        'user': {
            'id': user.id,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
            'is_chef_service': getattr(user, 'is_chef_service', False),
        }
    })
