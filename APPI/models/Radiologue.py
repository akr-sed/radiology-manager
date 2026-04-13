from django.db import models
from APPI.models.compte import Compte  

class Radiologue(Compte):
    class Meta:
        verbose_name = "Radiologue"
        verbose_name_plural = "Radiologues"

    def __str__(self):
        return f"Dr. {self.nom} {self.prenom} - Rôles : {', '.join([role.titre for role in self.roles.all()])}"
       