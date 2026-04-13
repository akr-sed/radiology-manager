from django.db import models
from APPI.models.compte import Compte  

class Admin(Compte):
    class Meta:
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"

    def __str__(self):
        return f"Admin {self.nom} {self.prenom} - Rôles : {', '.join([role.titre for role in self.roles.all()])}"
