from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.hashers import make_password

from APPI.models.Admin import Admin

from APPI.models.Role import Role



@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    email = "admin@example.com"
    password = "adminpassword"  # ← use a secure password in production

    if not Admin.objects.filter(email=email).exists():
        admin_role, _ = Role.objects.get_or_create(titre="admin")
        
        password=make_password(password)
        admin = Admin.objects.create(
            nom="Admin",
            prenom="Default",
            phonenumber="0000000000",
            date_naissance=timezone.datetime(1990, 1, 1),
            email=email,
            adresse="Administration",
            password=password,
            is_superuser=True,
            is_staff=True,
        )
        admin.roles.add(admin_role)
        print("✅ Default admin created.")
