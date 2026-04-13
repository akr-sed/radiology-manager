# APPI/utils.py
import torch
from ultralytics import YOLO

# PyTorch 2.6+ defaults to weights_only=True; patch for trusted local YOLO weights
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

# Charger 1 seule fois
yolo_model = YOLO(model="Models/YOLOV11_ECO.pt")
yolo_IRM_model = YOLO(model="Models/YOLOV11_IRM.pt")
yolo_MAMO_model = YOLO(model="Models/YOLOV11_MAMO.pt")
