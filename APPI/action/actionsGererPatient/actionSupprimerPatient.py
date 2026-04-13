from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from APPI.models import Patient
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Vérifie que l'utilisateur est authentifié
def supprimer_patient(request, patient_id):
    try:
        # Vérifiez si le patient existe
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Patient introuvable."}, status=404)

        # Supprimez le patient
        patient.delete()

        return JsonResponse({
            "status": "success",
            "message": f"Patient avec l'ID {patient_id} supprimé avec succès."
        }, status=200)

    except Exception as e:
        # Gestion des erreurs inattendues
        return JsonResponse({"status": "error", "message": f"Erreur serveur : {str(e)}"}, status=500)