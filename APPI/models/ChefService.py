from django.db import models
from APPI.models.compte import Compte  

class ChefService(Compte):
    class Meta:
        verbose_name = "Chef de service"
        verbose_name_plural = "Chefs de service"

    def __str__(self):
       
        return f"Dr. {self.nom} {self.prenom} - Rôles : {', '.join([role.titre for role in self.roles.all()])}"
