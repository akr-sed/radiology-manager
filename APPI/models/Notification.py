from django.db import models
from django.conf import settings
from django.utils import timezone
class Notification(models.Model):
    # Option 1: Garder les deux relations possibles
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name="Destinataire",
        null=True,  # Rendu optionnel
        blank=True
    )
    radiologue = models.ForeignKey(
        'Radiologue',
        on_delete=models.CASCADE,
        related_name='notifications_radiologue',
        verbose_name="Radiologue destinataire",
        null=True,
        blank=True
    )
    message = models.TextField(verbose_name="Message")
    created_at =models.DateTimeField(default=timezone.now)
    date_creation = models.DateTimeField(default=timezone.now)
    read = models.BooleanField(default=False, verbose_name="Lu")
    lu = models.BooleanField(default=False, verbose_name="Lu (alias)")
    rdv = models.ForeignKey(
        'RDV', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications',
        verbose_name="Rendez-vous associé"
    )
    patient = models.ForeignKey(
        'Patient',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications_patient',
        verbose_name="Patient associé"
    )
    type = models.CharField(max_length=50, default="info", verbose_name="Type de notification")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        if self.recipient:
            return f"Notification pour {self.recipient} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
        elif self.radiologue:
            return f"Notification pour {self.radiologue} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
        return f"Notification - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

    def save(self, *args, **kwargs):
        # Synchroniser les champs alias
        self.lu = self.read
        self.date_creation = self.created_at
        super().save(*args, **kwargs)