# Imports Django
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password, make_password

# Décorateurs DRF
from rest_framework.decorators import api_view

# Sécurité
from APPI.decorators_token import token_required

# Modèles
from APPI.models import Compte

# Utilitaires
import json

@token_required
@api_view(['PUT'])
def modifier_compte(request):
    """
    Permet à un utilisateur authentifié (Radiologue, ChefService, ou Admin)
    de modifier ses propres informations (nom, prénom, téléphone, adresse).
    L'email et le rôle ne sont pas modifiables.
    """
    try:
        data = json.loads(request.body)
        utilisateur = request.user

        utilisateur.nom = data.get('nom', utilisateur.nom)
        utilisateur.prenom = data.get('prenom', utilisateur.prenom)
        utilisateur.phonenumber = data.get('phonenumber', utilisateur.phonenumber)
        utilisateur.adresse = data.get('adresse', utilisateur.adresse)

        utilisateur.save()

        return JsonResponse({
            "status": "success",
            "message": "Compte modifié avec succès",
            "data": {
                "id": utilisateur.id,
                "nom": utilisateur.nom,
                "prenom": utilisateur.prenom,
                "email": utilisateur.email,
                "phonenumber": utilisateur.phonenumber,
                "adresse": utilisateur.adresse,
                "date_naissance": utilisateur.date_naissance.strftime("%Y-%m-%d") if utilisateur.date_naissance else None,
                "roles": list(utilisateur.roles.values_list('titre', flat=True)),
            }
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Format JSON invalide dans la requête"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur inattendue : {str(e)}"}, status=500)


@token_required
@api_view(['PUT'])
def changer_mot_de_passe(request):
    """
    Permet à un utilisateur authentifié de changer son mot de passe.
    Requiert l'ancien mot de passe pour vérification.
    """
    try:
        data = json.loads(request.body)
        utilisateur = request.user

        ancien_mdp = data.get('ancien_mot_de_passe', '')
        nouveau_mdp = data.get('nouveau_mot_de_passe', '')

        if not ancien_mdp or not nouveau_mdp:
            return JsonResponse({"status": "error", "message": "Tous les champs sont requis."}, status=400)

        if not check_password(ancien_mdp, utilisateur.password):
            return JsonResponse({"status": "error", "message": "Ancien mot de passe incorrect."}, status=400)

        utilisateur.password = make_password(nouveau_mdp)
        utilisateur.save()

        return JsonResponse({"status": "success", "message": "Mot de passe modifié avec succès."}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Format JSON invalide dans la requête"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Erreur inattendue : {str(e)}"}, status=500)
