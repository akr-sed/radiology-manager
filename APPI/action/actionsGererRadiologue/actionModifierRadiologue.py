from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist
from APPI.models import Radiologue, Role
import json
import traceback
import datetime
from APPI.models.Role import require_any_role, Role as RoleModel

@csrf_exempt
@require_any_role(RoleModel.CHEF_SERVICE, RoleModel.ADMIN)
@require_http_methods(['PUT'])
def modifier_radiologue(request, radiologue_id):
    print("Début de la fonction modifier_radiologue")
    print("ID reçu :", radiologue_id)
    
    try:
        # Analyse du corps de la requête
        try:
            data = json.loads(request.body)
            print("Données reçues:", data)
        except json.JSONDecodeError as e:
            print("Erreur de décodage JSON:", str(e))
            return JsonResponse({"status": "error", "message": "Format JSON invalide"}, status=400)
        
        # Récupération du radiologue
        try:
            radiologue = Radiologue.objects.get(id=radiologue_id)
            print(f"Radiologue trouvé: {radiologue.id} - {radiologue.nom}")
        except Radiologue.DoesNotExist:
            print(f"Radiologue avec ID {radiologue_id} non trouvé")
            return JsonResponse({"status": "error", "message": "Radiologue non trouvé."}, status=404)
        
        # Mise à jour des champs textuels simples
        print("Mise à jour des champs texte")
        if 'nom' in data:
            radiologue.nom = data['nom']
        
        if 'prenom' in data:
            radiologue.prenom = data['prenom']
        
        # Vérification de l'email
        if 'email' in data and data['email'] != radiologue.email:
            print(f"Mise à jour de l'email: {radiologue.email} -> {data['email']}")
            if Radiologue.objects.filter(email=data['email']).exclude(id=radiologue_id).exists():
                return JsonResponse({"status": "error", "message": "Email déjà utilisé."}, status=400)
            radiologue.email = data['email']
        
        # Mise à jour du mot de passe si fourni
        if 'password' in data and data['password']:
            print("Mise à jour du mot de passe")
            try:
                # Utiliser set_password de Django
                radiologue.set_password(data['password'])
            except Exception as e:
                print(f"Erreur lors de la mise à jour du mot de passe: {str(e)}")
                return JsonResponse({"status": "error", "message": f"Erreur lors de la mise à jour du mot de passe: {str(e)}"}, status=500)
        
        # Mise à jour des autres champs
        print("Mise à jour des champs additionnels")
        if 'phonenumber' in data:
            radiologue.phonenumber = data['phonenumber']
        
        if 'adresse' in data:
            radiologue.adresse = data['adresse']
        
        # Mise à jour de la date de naissance
        if 'date_naissance' in data and data['date_naissance']:
            print(f"Mise à jour de la date de naissance: {data['date_naissance']}")
            try:
                radiologue.date_naissance = datetime.datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
            except ValueError as e:
                print(f"Format de date invalide: {str(e)}")
                return JsonResponse({"status": "error", "message": f"Format de date invalide: {str(e)}"}, status=400)
        elif 'date_naissance' in data and not data['date_naissance']:
            radiologue.date_naissance = None
        
        # Mise à jour des rôles si fournis
        if 'roles' in data:
            print(f"Mise à jour des rôles: {data['roles']}")
            try:
                # Effacer les rôles existants
                radiologue.roles.clear()
                
                # Ajouter les nouveaux rôles
                for role_titre in data['roles']:
                    try:
                        role, created = Role.objects.get_or_create(titre=role_titre)
                        radiologue.roles.add(role)
                    except Exception as role_error:
                        print(f"Erreur lors de l'ajout du rôle {role_titre}: {str(role_error)}")
            except Exception as e:
                print(f"Erreur lors de la mise à jour des rôles: {str(e)}")
                return JsonResponse({"status": "error", "message": f"Erreur lors de la mise à jour des rôles: {str(e)}"}, status=500)
        
        # Sauvegarde des modifications
        print("Sauvegarde des modifications")
        radiologue.save()
        print(f"Radiologue {radiologue.id} mis à jour avec succès")
        
        # Construction de la réponse
        role_titres = [role.titre for role in radiologue.roles.all()]
        return JsonResponse({
            "status": "success", 
            "message": "Radiologue modifié avec succès.",
            "radiologue": {
                "id": radiologue.id,
                "nom": radiologue.nom,
                "prenom": radiologue.prenom,
                "email": radiologue.email,
                "phonenumber": radiologue.phonenumber,
                "adresse": radiologue.adresse,
                "date_naissance": radiologue.date_naissance.isoformat() if radiologue.date_naissance else None,
                "roles": role_titres
            }
        })
        
    except Exception as e:
        # Traçage complet de l'erreur pour le débogage
        print(f"Erreur lors de la modification du radiologue avec l'ID {radiologue_id}")
        print(f"Message d'erreur: {str(e)}")
        traceback.print_exc()  # Imprime la pile d'appels complète
        
        return JsonResponse({
            "status": "error", 
            "message": f"Erreur lors de la mise à jour du radiologue: {str(e)}"
        }, status=500)