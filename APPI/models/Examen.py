from django.db import models

class Examen(models.Model):
    date = models.DateTimeField()
    type = models.CharField(max_length=100)
    status = models.CharField(max_length=50, choices=[('en_attente', 'En attente'), ('complet', 'Complet')])
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE)

    def __str__(self):
        return f"Examen {self.type} pour {self.patient} le {self.date}"