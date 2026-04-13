from functools import wraps
from django.db import models
from django.contrib.auth.models import Group, User
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class Role(models.Model):
    RADIOLOGUE = 'radiologue'
    CHEF_SERVICE = 'chef_service'
    ADMIN = 'admin'
    SECRETAIRE = 'secretaire'

    ROLE_CHOICES = [
        (RADIOLOGUE, 'Radiologue'),
        (CHEF_SERVICE, 'Chef de service'),
        (ADMIN, 'Administrateur'),
        (SECRETAIRE, 'Secrétaire'),
    ]

    titre = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    group = models.OneToOneField(Group, on_delete=models.CASCADE, related_name='role', blank=True, null=True)

    def __str__(self):
        return self.titre


def _authenticate_jwt(request):
    """Authenticate request via JWT and set request.user. Returns error response or None."""
    if not hasattr(request, 'user') or not request.user.is_authenticated:
        try:
            auth = JWTAuthentication()
            result = auth.authenticate(request)
            if result is None:
                return JsonResponse({"status": "error", "message": "Authentification requise"}, status=401)
            request.user, _ = result
        except AuthenticationFailed:
            return JsonResponse({"status": "error", "message": "Token invalide ou expiré"}, status=401)
    return None


def is_in_group(user, group_name: str) -> bool:
    return user.groups.filter(name=group_name).exists()

def is_radiologue(user) -> bool:
    return is_in_group(user, Role.RADIOLOGUE)

def is_chef_service(user) -> bool:
    return is_in_group(user, Role.CHEF_SERVICE)

def is_admin(user) -> bool:
    return is_in_group(user, Role.ADMIN)

def is_secretaire(user) -> bool:
    return is_in_group(user, Role.SECRETAIRE)


def required_role(role_constante: str):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            auth_error = _authenticate_jwt(request)
            if auth_error:
                return auth_error
            user_groups = {g.name for g in request.user.groups.all()}
            if 'admin' not in user_groups and role_constante not in user_groups:
                return JsonResponse({"status": "error", "message": "Accès refusé"}, status=403)
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator


def require_any_role(*roles_constantes):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            auth_error = _authenticate_jwt(request)
            if auth_error:
                return auth_error
            user_groups = {group.name for group in request.user.groups.all()}
            # Admin always has access to all endpoints
            if 'admin' not in user_groups and not any(r in user_groups for r in roles_constantes):
                return JsonResponse({"status": "error", "message": "Accès refusé"}, status=403)
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator


def json_required_role(role_constante):
    return required_role(role_constante)
