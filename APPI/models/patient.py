from django.db import models
import datetime
from django.utils import timezone

class Patient(models.Model):
    id = models.AutoField(primary_key=True, blank=False, null=False)
    nom = models.CharField(max_length=100, blank=False, null=False)
    prenom = models.CharField(max_length=100, default="Adresse inconnue")
    phonenumber = models.CharField(max_length=15, default="Adresse inconnue")
    date_naissance = models.DateField(default=datetime.date(2000, 1, 1))
    email = models.EmailField(unique=True, default="Adresse inconnue")
    adresse = models.CharField(max_length=150, default="Adresse inconnue")
    radiologue = models.ForeignKey('APPI.Radiologue', on_delete=models.CASCADE, related_name='patients')
    
    # ⚠️ Pas besoin de déclarer imageRadiologique ici — c'est accessible automatiquement
    # via related_name dans ImageRadiologique.patient
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Patient {self.nom} {self.prenom}"
    
    @property
    def imageRadiologique(self):
        return self.imageRadiologique.all()  # récupère la liste grâce à related_name