from django.http import FileResponse, JsonResponse
import os
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.utils.encoding import smart_str
from APPI.decorators_token import token_required
from APPI.models.Role import require_any_role, Role


@csrf_exempt
@require_GET
@token_required
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE)
def download_rapport_ia(request, patient_id):
    """Téléchargement du rapport PDF avec headers CORS et réponse PDF directe"""

    rapport_filename = f"rapport_radiologique_{patient_id}.pdf"
    rapport_path = os.path.join(os.path.realpath('.'), f'media/Rapports/{patient_id}', rapport_filename)

    if not os.path.exists(rapport_path):
        return JsonResponse({'error': 'Rapport non trouvé'}, status=404)

    # ✅ Retourne un vrai fichier PDF
    file_handle = open(rapport_path, 'rb')
    response = FileResponse(file_handle, content_type='application/pdf')

    # Headers nécessaires
    response['Content-Disposition'] = f'inline; filename="{smart_str(rapport_filename)}"'
    response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'

    print(f"✅ Rapport {rapport_filename} envoyé avec content-type PDF.")
    return response
