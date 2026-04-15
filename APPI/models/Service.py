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
    # Stored as comma-separated values to support multiple selections
    modalites = models.CharField(max_length=255, default='xray', blank=True)
    organes = models.CharField(max_length=255, default='autre', blank=True)
    ai_models = models.CharField(max_length=255, default='none', blank=True)

    MODALITY_MAP = dict(MODALITY_CHOICES)
    ORGAN_MAP = dict(ORGAN_CHOICES)
    AI_MODEL_MAP = dict(AI_MODEL_CHOICES)

    def get_modalites_list(self):
        return [m for m in self.modalites.split(',') if m]

    def get_organes_list(self):
        return [o for o in self.organes.split(',') if o]

    def get_ai_models_list(self):
        return [a for a in self.ai_models.split(',') if a]

    def get_modalites_display(self):
        return [self.MODALITY_MAP.get(m, m) for m in self.get_modalites_list()]

    def get_organes_display(self):
        return [self.ORGAN_MAP.get(o, o) for o in self.get_organes_list()]

    def get_ai_models_display(self):
        return [self.AI_MODEL_MAP.get(a, a) for a in self.get_ai_models_list()]

    def __str__(self):
        return f"{self.nom} ({self.nom_hopital})"
