from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from APPI.models.Role import Role


class CompteManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Un email est requis')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        user.set_password(password)  # ✅ Hash le mot de passe
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)
        return self.create_user(email, password, **extra_fields)



class Compte(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100, default="Prénom inconnu")
    phonenumber = models.CharField(max_length=10, default="Numéro inconnu")
    date_naissance = models.DateField(default=timezone.datetime(2000, 1, 1))
    email = models.EmailField(unique=True)
    adresse = models.CharField(max_length=150, default="Adresse inconnue")
    roles = models.ManyToManyField(Role, blank=True)

    # Champs hérités qu’on redéclare pour générer la migration
    last_login    = models.DateTimeField('dernière connexion', blank=True, null=True)
    is_superuser  = models.BooleanField('superuser status', default=False)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    date_joined   = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom','phonenumber']
    objects = CompteManager()

    def __str__(self):
        roles_list = ", ".join([role.titre for role in self.roles.all()])
        return f"{self.nom} {self.prenom} – Rôles : {roles_list or 'Aucun rôle'}"

    def save(self, *args, **kwargs):
        if not self.pk:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
        for role in self.roles.all():
            try:
                group = Group.objects.get(name=role.titre)
                self.groups.add(group)
            except Group.DoesNotExist:
                pass