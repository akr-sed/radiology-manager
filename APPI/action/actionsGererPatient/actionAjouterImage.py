from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from APPI.models import Patient, ImageRadiologique
from rest_framework.decorators import api_view
from APPI.models.Role import require_any_role, Role
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image
import io
import os

@csrf_exempt
@api_view(['POST'])
@require_any_role(Role.SECRETAIRE, Role.RADIOLOGUE, Role.CHEF_SERVICE)
def ajouter_image(request):
    id = request.POST.get('patient_id')
    image_type = request.POST.get('image_type')
    file = request.FILES.get('file')

    if not id or not image_type or not file:
        return JsonResponse({
            "status": "error",
            "message": "Champs obligatoires manquants."
        }, status=400)

    try:
        patient = Patient.objects.get(pk=id)
    except Patient.DoesNotExist:
        return JsonResponse({
            "status": "error",
            "message": "Patient introuvable."
        }, status=404)

    # ✅ Créer le dossier complet : media/Radiologies/ECO/7/
    folder = os.path.join('Radiologies', image_type, str(patient.id))
    upload_dir = os.path.join(settings.MEDIA_ROOT, folder)
    os.makedirs(upload_dir, exist_ok=True)

    # ✅ Redimensionner l'image à 640×640
    img = Image.open(file)
    img = img.convert('RGB')  # Pour éviter des erreurs sur PNG/transparence



    # ✅ Enregistrer dans un fichier en mémoire
    img_io = io.BytesIO()
    img.save(img_io, format='JPEG', quality=90)  # toujours en JPEG
    img_io.seek(0)
 
    # ✅ Générer un nom de fichier
    file_name = os.path.splitext(file.name)[0] + '.jpg'
    file_path_local = os.path.join(folder, file_name)  # relatif à MEDIA_ROOT

    # ✅ Sauvegarder via default_storage
    saved_path = default_storage.save(file_path_local, ContentFile(img_io.read()))

    # ✅ URL publique = MEDIA_URL + chemin relatif
    file_url = os.path.join(settings.MEDIA_URL, saved_path)

    # ✅ Créer l'objet ImageRadiologique
    imgradio = ImageRadiologique(
        patient=patient,
        path=file_url,
        modalite=image_type
    )
    imgradio.save()

    return JsonResponse({
        "status": "success",
        "message": "Image radiologique enregistrée avec succès.",
        "image_id": imgradio.id,
        "path": imgradio.path
    }, status=201)
