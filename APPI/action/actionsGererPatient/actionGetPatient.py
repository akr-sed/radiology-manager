from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from APPI.models.patient import Patient
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient(request, id):
    """
    Récupère les informations d'un patient spécifique par son ID.
    """
    patient = get_object_or_404(Patient, id=id)
    data = {
        'id': patient.id,
        'nom': patient.nom,
        'prenom': patient.prenom,
        'phonenumber': patient.phonenumber,
        'date_naissance': patient.date_naissance.strftime('%Y-%m-%d'),
        'email': patient.email,
        'adresse': patient.adresse,
    }
    return JsonResponse(data, status=200)