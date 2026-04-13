from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Gestion des erreurs 404 en JSON
def custom_404(request, exception):
    return JsonResponse({
        'error': 'Page not found',
        
    }, status=404)

# Gestion des erreurs 500 en JSON
def custom_500(request):
    return JsonResponse({
        'error': 'Internal server error',
        'details': 'Une erreur interne s\'est produite, veuillez réessayer plus tard.'
    }, status=500)

urlpatterns = [
   path('admin/', admin.site.urls),
   path('', include('APPI.urls')),  # Redirige les URL commençant par APPI/ vers APPI/urls.py
]

# ✅ This is required to serve media files (images) in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Ajoute tes gestionnaires d'erreurs ici
handler404 = custom_404
handler500 = custom_500
