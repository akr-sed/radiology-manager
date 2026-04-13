from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .action.actionLogin import login_utilisateur
from .action.actionsGererPatient.actionAjouterPatient import ajouter_patient
from .action.actionsGererPatient.actionModifierPatient import modifier_patient
from .action.actionsGererPatient.actionSupprimerPatient import supprimer_patient
from .action.actionsGererPatient.actionListPatients import patient_list
from .action.actionsGererPatient.actionListImages import listImagePatient

from .action.actionsGererRadiologue.actionAjouterRadiologue import ajouter_radiologue
from .action.actionsGererRadiologue.actionSupprimerRadiologue import supprimer_radiologue
from .action.actionsGererRadiologue.actionModifierRadiologue import modifier_radiologue
from .action.actionsGererRadiologue.actionListRadiologue import list_radiologues

from .action.actionsGererChefService.ajouterChefService import ajouter_chefService
from .action.actionsGererChefService.actionSupprimerChefService import supprimer_chef_service
from .action.actionsGererChefService.actionModifierChefService import modifier_chefService
from .action.actionsGererChefService.actionListChefService import list_chef_service

from .action.actionsGererRDV.actionAjouterRDV import ajouter_rdv
from .action.actionsGererRDV.actionSupprimerRDV import supprimer_rdv
from .action.actionsGererRDV.actionModifierRDV import modifier_rdv
from .action.actionsGererRDV.actionListRDV import rdv_list 
from .action.actionsGererRDV.actionValiderRDV import valider_rdv

from .action.actionsGererService.actionAjouterService import ajouter_service
from .action.actionsGererService.actionSupprimerService import supprimer_service
from .action.actionsGererService.actionModifierService import modifier_service
from .action.actionsGererService.actionListService import service_list
from .action.actionsGererPatient.actionAjouterImage import ajouter_image
from .action.actionsGererPatient.actionGetPatient import get_patient
from .action.actionsGererPatient.actionSupprimerImageRadiologique import suprimer_image

from .action.actionsGererImageRadiologique.actionGetImageRadiologique import get_image_radiologique

from .action.actionGererAnnotation.actionSauvgraderAnnotation import actionSauvgraderAnnotation
from .action.actionGererAnnotation.actionLoadAnnotation import loadAnnotation

from .action.actionLogin import verify_token
from .action.stats import dashboard_stats
from .action.IA.ia_eco import performe_ia_eco
from .action.IA.agenticAi import performeCancerAnalyseAgenticApproach
from .action.IA.repport import download_rapport_ia

from django.urls import path
from .action.actionsNotification import get_notifications, marquer_lu

from .action.actionsGererRDV.actionRepondreRDV import repondre_rdv
from .action.actionModifierCompte import modifier_compte, changer_mot_de_passe
from django.http import HttpResponse
urlpatterns = [
    path('api/login/verify/', verify_token, name='verify_token'),
    
    # User login route
    path('login/', login_utilisateur, name='login'),
    
    # Ajouter un Patient
    path('api/ajouterPatient', ajouter_patient, name='ajouter_patient'),
    
    # Modifier un Patient
    path('api/patient/<int:id>/', modifier_patient, name='modifier_patient'),
    path('api/patient/listimages/', listImagePatient, name='listImagePatient'),
    # Supprimer un Patient
    path('api/supprimerPatient', supprimer_patient, name='supprimer_patient'),

    # API afficher list patient
    path('api/patients/', patient_list, name='get_patients'),

    # Ajouter un Radiologue
    path('api/ajouterRadiologue/', ajouter_radiologue, name='ajouter_radiologue'),

    # Supprimer un Radiologue
  path('api/supprimer_radiologue/<int:radiologue_id>/', supprimer_radiologue, name='supprimer_radiologue'),
    
     # Modifier un Radiologue
    path('api/modifierRadiologue/<int:radiologue_id>/', modifier_radiologue, name='modifier_radiologue'),
    
    # Ajouter un ChefService
    path('api/ajouterChefService', ajouter_chefService, name='ajouter_chefService'),

    # Supprimer un ChefService
    path('api/supprimerChefService', supprimer_chef_service, name='supprimer_chef_service'),
    
    # Modifier un ChefService
    path('api/modifierChefService', modifier_chefService, name='modifier_chefService'),
    
    #list ChefService
    path('api/ChefService', list_chef_service, name='list_chef_service'),

    # Ajouter un RDV
   path('api/ajouter_rdv/', ajouter_rdv, name='ajouter_rdv'),

    # Supprimer un RDV
    path('api/supprimer_rdv/<int:rdv_id>/', supprimer_rdv, name='supprimer_rdv'),

    # Modifier un RDV
    path('api/modifier_rdv/<int:rdv_id>/', modifier_rdv, name='modifier_rdv'),
    
    # List RDV
      path('api/rdv_list/', rdv_list, name='rdv_list'),
    #validerRDV
      path('api/valider_rdv/<int:rdv_id>/', valider_rdv, name='valider_rdv'),
  # Ajouter un service
  path('api/ajouterService', ajouter_service, name='ajouter_service'),

  # Supprimer un service
  path('api/supprimerService', supprimer_service, name='supprimer_service'),

  # Modifier un service
  path('api/modifierService', modifier_service, name='modifier_service'),
  
  # List service
  path('api/services', service_list, name='service_list' ),
  #nouvele route
    
    #path('api/patients/<int:patient_id>/', supprimer_patient, name='supprimer_patient'),
path('api/supprimerPatient/<int:patient_id>/', supprimer_patient, name='supprimer_patient'),
#recuperer un patient par son id
#path('api/patients/<int:id>/', get_patient, name='get_patient'),
#listeradiologue
#pour les dtatistiqyue de dashbored
path('api/dashboard/stats/', dashboard_stats, name='dashboard_stats'),
path('api/radiologues/', list_radiologues, name='list_radiologues'),
path('api/notifications/', get_notifications, name='get_notifications'),
path('api/notifications/<int:notif_id>/lu/', marquer_lu, name='marquer_lu'),
path('api/repondre_rdv/<int:rdv_id>/', repondre_rdv, name='repondre_rdv'),
path("api/notifications/", get_notifications),
# List service
path('api/ia/eco/', performe_ia_eco, name='ia_eco' ),
path('api/ia/analyse/', performeCancerAnalyseAgenticApproach, name='agenticaianalyse' ),
path('api/ia/rapport/<int:patient_id>/', download_rapport_ia, name='repportdownload' ),

path('api/patient/addimg/', ajouter_image, name='ia_eco' ),
path('api/patient/supprimerimage/', suprimer_image, name='ia_eco' ),
path('api/sauvgarderAnnotation',actionSauvgraderAnnotation,name='saveannotations'),
path('api/loadimage/',get_image_radiologique,name='loadimage'),
path('api/load-annotations',loadAnnotation,name='saveannotations'),

# Account management
path('api/modifier-compte/', modifier_compte, name='modifier_compte'),
path('api/changer-mot-de-passe/', changer_mot_de_passe, name='changer_mot_de_passe'),
]
