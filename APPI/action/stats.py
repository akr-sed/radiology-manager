from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta
from django.utils import timezone
from APPI.models import Patient, RDV, Examen, Rapport, Compte
import traceback
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    try:
        user = request.user
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        two_weeks_ago = now - timedelta(days=14)

        is_radiologue = hasattr(user, 'radiologue')

        if is_radiologue:
            radiologue = user.radiologue
            patients_filter = {'radiologue': radiologue}
            rdv_filter = {'patient__radiologue': radiologue}
            examen_filter = {'patient__radiologue': radiologue}
            rapport_filter = {'examen__patient__radiologue': radiologue}
        else:
            patients_filter = {}
            rdv_filter = {}
            examen_filter = {}
            rapport_filter = {}

        # Utilisation de date__gte plutôt que created_at__gte pour éviter les erreurs
        # si un modèle n'a pas ce champ exact
        
        # Stats patients
        try:
            patients_total = Patient.objects.filter(**patients_filter).count()
            nouveaux_filter = patients_filter.copy()
            date_field = 'created_at' if hasattr(Patient, 'created_at') else 'date_creation'
            nouveaux_filter[f'{date_field}__gte'] = week_ago
            patients_nouveaux = Patient.objects.filter(**nouveaux_filter).count()

            last_week_filter = patients_filter.copy()
            last_week_filter[f'{date_field}__gte'] = two_weeks_ago
            last_week_filter[f'{date_field}__lt'] = week_ago
            patients_last_week = Patient.objects.filter(**last_week_filter).count()
            
            patients_variation = calculate_variation(patients_nouveaux, patients_last_week)
        except Exception as e:
            logger.error(f"Erreur lors du calcul des stats patients: {str(e)}")
            patients_total = 0
            patients_nouveaux = 0
            patients_variation = 0

        # Stats rendez-vous
        try:
            rendez_vous_total = RDV.objects.filter(**rdv_filter).count()
            prochain_rdv = RDV.objects.filter(**rdv_filter, date__gte=now).order_by('date').first()
            prochain_rdv_heure = prochain_rdv.date.strftime("%H:%M %d/%m/%Y") if prochain_rdv and hasattr(prochain_rdv, 'date') and prochain_rdv.date else ""
            prochain_rdv_type = prochain_rdv.lieu if prochain_rdv and hasattr(prochain_rdv, 'lieu') else ""

            rdv_this_week = RDV.objects.filter(**rdv_filter, date__gte=week_ago).count()
            rdv_last_week = RDV.objects.filter(**rdv_filter, date__gte=two_weeks_ago, date__lt=week_ago).count()
            rdv_variation = calculate_variation(rdv_this_week, rdv_last_week)
        except Exception as e:
            logger.error(f"Erreur lors du calcul des stats RDV: {str(e)}")
            rendez_vous_total = 0
            prochain_rdv_heure = ""
            prochain_rdv_type = ""
            rdv_variation = 0

        # Stats examens
        try:
            examens_total = Examen.objects.filter(**examen_filter).count()
            examens_en_attente = Examen.objects.filter(**examen_filter, status='en_attente').count()
            examens_this_week = Examen.objects.filter(**examen_filter, date__gte=week_ago).count()
            examens_last_week = Examen.objects.filter(**examen_filter, date__gte=two_weeks_ago, date__lt=week_ago).count()
            examens_variation = calculate_variation(examens_this_week, examens_last_week)
        except Exception as e:
            logger.error(f"Erreur lors du calcul des stats examens: {str(e)}")
            examens_total = 0
            examens_en_attente = 0
            examens_variation = 0

        # Stats rapports
        try:
            rapports_total = Rapport.objects.filter(**rapport_filter).count()
            dernier_rapport = Rapport.objects.filter(**rapport_filter).order_by('-date_creation').first()
            date_limite = dernier_rapport.date_creation.strftime("%d/%m/%Y") if dernier_rapport and dernier_rapport.date_creation else "Aucune"

            date_field = 'date_creation' if hasattr(Rapport, 'date_creation') else 'created_at'
            rapports_this_week = Rapport.objects.filter(**rapport_filter, **{f'{date_field}__gte': week_ago}).count()
            rapports_last_week = Rapport.objects.filter(**rapport_filter, **{f'{date_field}__gte': two_weeks_ago, f'{date_field}__lt': week_ago}).count()
            rapports_variation = calculate_variation(rapports_this_week, rapports_last_week)
        except Exception as e:
            logger.error(f"Erreur lors du calcul des stats rapports: {str(e)}")
            rapports_total = 0
            date_limite = "Aucune"
            rapports_variation = 0

        # Stats radiologues
        try:
            radiologues_count = Compte.objects.filter(groups__name='radiologue').count()
        except Exception as e:
            logger.error(f"Erreur lors du calcul des stats radiologues: {str(e)}")
            radiologues_count = 0

        # Préparation des données utilisateur pour le frontend
        user_data = {
            "id": user.id,
            "nom": getattr(user, 'nom', getattr(user, 'last_name', '')),
            "prenom": getattr(user, 'prenom', getattr(user, 'first_name', ''))
        }

        stats = {
            "status": "success",
            "user": user_data,
            "stats": {
                "patients": {
                    "total": patients_total,
                    "nouveaux": patients_nouveaux,
                    "variation": patients_variation
                },
                "rendezVous": {
                    "total": rendez_vous_total,
                    "prochain": {
                        "heure": prochain_rdv_heure,
                        "type": prochain_rdv_type
                    },
                    "variation": rdv_variation
                },
                "examens": {
                    "total": examens_total,
                    "enAttente": examens_en_attente,
                    "variation": examens_variation
                },
                "rapports": {
                    "total": rapports_total,
                    "dateLimite": date_limite,
                    "variation": rapports_variation
                },
                "radiologues": radiologues_count
            }
        }

        return JsonResponse(stats)

    except Exception as e:
        logger.error(f"Erreur globale dans dashboard_stats: {str(e)}")
        logger.error(traceback.format_exc())
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def calculate_variation(current, previous):
    """Calcule la variation en pourcentage entre deux valeurs, évite la division par zéro"""
    try:
        if previous > 0:
            return int(((current - previous) / previous) * 100)
        elif current > 0:
            return 100  # Augmentation de 0 à quelque chose = 100%
        else:
            return 0  # Pas de changement
    except Exception:
        return 0