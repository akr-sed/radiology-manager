from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from functools import wraps

def token_required(view_func):
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        authenticator = JWTAuthentication()
        try:
            # Authentifie l'utilisateur à partir du token JWT présent dans l'en-tête Authorization
            user_auth_tuple = authenticator.authenticate(request)

            # Si aucun token ou token invalide
            if user_auth_tuple is None:
                raise AuthenticationFailed("Authentification requise")

            # On associe l'utilisateur au request.user
            request.user, _ = user_auth_tuple

        except AuthenticationFailed as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=401)

        # Si tout est bon, on exécute la vue normalement
        return view_func(request, *args, **kwargs)

    return wrapped_view
