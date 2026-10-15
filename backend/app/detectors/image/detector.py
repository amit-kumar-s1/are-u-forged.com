"""ResNet-18 adapter (v1: torchvision resnet18, fc -> Linear(512, 2), 224x224, ImageNet normalisation).
VERIFY against your training code: normalisation constants and class order (IMAGE_FAKE_CLASS_INDEX).
For v2/v3 (EfficientNet-B4 / DINOv2) add a sibling Detector class and register it."""
import io, os, threading
from app.core.config import get_settings
from app.detectors.base import Detector, DetectorUnavailable, RawPrediction

class ResNet18ImageDetector(Detector):
    modality = "image"
    def __init__(self):
        self._model = None
        self._lock = threading.Lock()

    def _load(self):
        s = get_settings()
        if not s.image_model_path or not os.path.isfile(s.image_model_path):
            raise DetectorUnavailable("Image model weights not found. Set IMAGE_MODEL_PATH (see docs/MODEL_INTEGRATION.md).")
        try:
            import torch
            from torchvision import models
        except ImportError as e:
            raise DetectorUnavailable("torch/torchvision are not installed on the backend.") from e
        obj = torch.load(s.image_model_path, map_location=s.device)
        if isinstance(obj, dict):
            m = models.resnet18(weights=None)
            m.fc = torch.nn.Linear(m.fc.in_features, 2)
            m.load_state_dict(obj.get("model_state_dict", obj))
        else:
            m = obj
        self._model = m.to(s.device).eval()

    def predict(self, image_bytes: bytes) -> RawPrediction:
        if self._model is None:
            with self._lock:
                if self._model is None:
                    self._load()
        import torch
        from PIL import Image
        from torchvision import transforms as T
        s = get_settings()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tf = T.Compose([T.Resize((224, 224)), T.ToTensor(),
                        T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
        with torch.no_grad():
            probs = torch.softmax(self._model(tf(img).unsqueeze(0).to(s.device)), dim=1)[0]
        return RawPrediction(float(probs[s.image_fake_class_index]), s.image_model_name, {"input_size": "224x224"})
