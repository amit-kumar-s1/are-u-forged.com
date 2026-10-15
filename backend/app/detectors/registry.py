from app.detectors.base import Detector
from app.detectors.image.detector import ResNet18ImageDetector
from app.detectors.video.detector import PendingVideoDetector
from app.detectors.text.detector import PendingTextDetector

_REGISTRY: dict[str, Detector] = {}

def get_detector(modality: str) -> Detector:
    if not _REGISTRY:
        for d in (ResNet18ImageDetector(), PendingVideoDetector(), PendingTextDetector()):
            _REGISTRY[d.modality] = d
    return _REGISTRY[modality]
