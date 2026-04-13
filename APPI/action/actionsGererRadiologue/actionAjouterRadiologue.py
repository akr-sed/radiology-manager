from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from APPI.models import Radiologue, Role
from APPI.models.Role import required_role
import json
import datetime
from rest_framework.decorators import api_view
@api_view(['POST'])
@required_role(Role.CHEF_SERVICE)
@csrf_exempt
def ajouter_radiologue(request):
    if request.method == 'POST':
        try:
            # Décodage du corps de la requête
            data = json.loads(request.body)
            
            # Vérification du token JWT (optionnel - ajoutez si nécessaire)
            # auth_header = request.headers.get('Authorization', '')
            # if auth_header.startswith('Bearer '):
            #     token = auth_header.split(' ')[1]
            #     # Vérifiez le token ici
            
            # Récupération des données
            nom = data.get('nom')
            prenom = data.get('prenom')
            email = data.get('email')
            password = data.get('password')
            phonenumber = data.get('phonenumber', 'Numéro inconnu')
            adresse = data.get('adresse', 'Adresse inconnue')
            date_naissance_str = data.get('date_naissance', '2000-01-01')
            roles = data.get('roles', ['RADIOLOGUE'])  # Par défaut, le rôle RADIOLOGUE
            
            # Validation des champs obligatoires
            if not nom or not prenom or not email or not password:
                return JsonResponse({"status": "error", "message": "Champs obligatoires manquants."}, status=400)
            
            # Vérification d'email unique
            if Radiologue.objects.filter(email=email).exists():
                return JsonResponse({"status": "error", "message": "Email déjà utilisé."}, status=400)
            
            # Conversion et validation de la date
            try:
                date_naissance = datetime.datetime.strptime(date_naissance_str, '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({"status": "error", "message": "Date invalide. Format attendu : AAAA-MM-JJ"}, status=400)
            
            # Hashage du mot de passe (bonne pratique de sécurité)
            # Décommentez ce bloc si vous utilisez un système de hashage dans votre application
            # Exemple avec bcrypt ou django.contrib.auth.hashers
            # from django.contrib.auth.hashers import make_password
            # hashed_password = make_password(password)
            
            # Création du radiologue
            radiologue = Radiologue(
                nom=nom,
                prenom=prenom,
                email=email,
                password=password,  # Remplacez par hashed_password si vous utilisez le hashage
                phonenumber=phonenumber,
                adresse=adresse,
                date_naissance=date_naissance
            )
            radiologue.save()  # Sauvegarde du radiologue
            
            # Gestion des rôles
            erreurs_roles = []
            for role_titre in roles:
                try:
                    # Création automatique du rôle RADIOLOGUE s'il n'existe pas
                    role, created = Role.objects.get_or_create(titre=role_titre)
                    radiologue.roles.add(role)  # Ajouter le rôle au radiologue
                except Exception as e:
                    erreurs_roles.append(f"{role_titre} ({str(e)})")
            
            # Vérifier s'il y a des erreurs avec les rôles
            if erreurs_roles:
                return JsonResponse({
                    "status": "partial_success",
                    "message": f"Radiologue ajouté mais problèmes avec les rôles : {', '.join(erreurs_roles)}",
                    "radiologue_id": radiologue.id
                }, status=207)  # 207 Multi-Status
            
            return JsonResponse({
                "status": "success",
                "message": "Radiologue ajouté avec succès et rôles attribués.",
                "radiologue_id": radiologue.id
            }, status=201)
        
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Format JSON invalide."}, status=400)
        except Exception as e:
            # Log l'erreur pour diagnostic
            import traceback
            print(f"Erreur lors de l'ajout d'un radiologue: {str(e)}")
            print(traceback.format_exc())
            return JsonResponse({"status": "error", "message": f"Erreur serveur: {str(e)}"}, status=500)
    
    return JsonResponse({"status": "error", "message": "Méthode non autorisée"}, status=405)