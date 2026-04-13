from django.db import models

class Service(models.Model):
    MODALITY_CHOICES = [
        ('xray', 'Radiographie (X-Ray)'),
        ('irm', 'IRM'),
        ('mammographie', 'Mammographie'),
        ('echographie', 'Echographie'),
        ('scanner', 'Scanner (CT)'),
    ]

    ORGAN_CHOICES = [
        ('thorax', 'Thorax'),
        ('abdomen', 'Abdomen'),
        ('cerveau', 'Cerveau'),
        ('sein', 'Sein'),
        ('os', 'Os / Articulations'),
        ('coeur', 'Coeur'),
        ('pelvis', 'Pelvis'),
        ('colonne', 'Colonne vertébrale'),
        ('autre', 'Autre'),
    ]

    AI_MODEL_CHOICES = [
        ('none', 'Aucun'),
        ('YOLOV11_ECO', 'YOLOv11 - Echographie'),
        ('YOLOV11_IRM', 'YOLOv11 - IRM'),
        ('YOLOV11_MAMO', 'YOLOv11 - Mammographie'),
    ]

    nom = models.CharField(max_length=100)
    nom_hopital = models.CharField(max_length=150)
    adresse = models.CharField(max_length=200)
    modalite = models.CharField(max_length=50, choices=MODALITY_CHOICES, default='xray')
    organe = models.CharField(max_length=50, choices=ORGAN_CHOICES, default='autre')
    ai_model = models.CharField(max_length=50, choices=AI_MODEL_CHOICES, default='none')

    def __str__(self):
        return f"{self.nom} - {self.get_modalite_display()} ({self.nom_hopital})"
