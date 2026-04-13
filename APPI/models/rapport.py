from django.db import models
from django.utils import timezone

class Rapport(models.Model):
    examen = models.ForeignKey('Examen', on_delete=models.CASCADE, related_name='rapports')  # Ajout de cette ligne
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    date_creation = models.DateTimeField(default=timezone.now)
    statut = models.CharField(max_length=50, choices=[('en_attente', 'En attente'), ('complet', 'Complet')])
    
    def __str__(self):
        return self.titre