from django.db import models
from .patient import Patient
from django.utils import timezone

class ImageRadiologique(models.Model):
    MODALITE_CHOICES = [
        ('IRM', 'IRM (Imagerie par Résonance Magnétique)'),
        ('MAMO', 'MAMO (Mammographie)'),
        ('ECO', 'ECHO (Échographie)'),
    ]

    id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='imageRadiologique')
    path = models.CharField( max_length=400,blank=False, null=False)
    date = models.DateField(default=timezone.now)
    modalite = models.CharField(max_length=4, choices=MODALITE_CHOICES)

    def __str__(self):
        return f"Image {self.modalite} - {self.date}"
    
    
