from django.apps import AppConfig

class AppiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'APPI'

    def ready(self):
        #Import ici pour éviter les problèmes de chargement circulaire
        from django.contrib.auth.models import Group
        from django.db.utils import OperationalError, ProgrammingError
        from .models.Role import Role

        try:
            #Pour chaque rôle défini dans les choix, on vérifie qu'il existe
            for role_const, _ in Role.ROLE_CHOICES:
                group, _ = Group.objects.get_or_create(name=role_const)
                Role.objects.get_or_create(titre=role_const, defaults={'group': group})

        except (OperationalError, ProgrammingError):
            #Arrive si la DB est pas encore prête (migrate, test) a cause du ficher 0002
            pass
