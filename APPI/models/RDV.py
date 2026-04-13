from django.db import models
from APPI.models import Patient, Radiologue
from django.conf import settings
import datetime

class RDV(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='rdvs')
    radiologue = models.ForeignKey(Radiologue, on_delete=models.CASCADE, related_name='rdvs')
    date = models.DateTimeField()
    lieu = models.CharField(max_length=100)
    type = models.CharField(max_length=100, default="Examen (mammographie)")
    status = models.CharField(max_length=50, default="Planifié")
    accepte = models.BooleanField(default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='created_rdvs')

    def __str__(self):
        return f"RDV: {self.patient} avec {self.radiologue} le {self.date}"