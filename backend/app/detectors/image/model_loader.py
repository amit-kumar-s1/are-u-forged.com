
import os
import threading

import torch
from huggingface_hub import hf_hub_download

from app.core.config import get_settings
from app.detectors.base import DetectorUnavailable
from app.detectors.image.architectures import build_models

WEIGHTS = {
    "resnet18": "deepfake_image.pth",
    "efficientnet_b4": "Gravex200_best_model.pth",
    "dinov2": "best_model.pth",
}

_MODELS = None
_DEVICE = None
_LOCK = threading.Lock()


def _get_device():
    requested = get_settings().device.lower()

    if requested == "auto":
        return torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    device = torch.device(requested)

    if device.type == "cuda" and not torch.cuda.is_available():
        raise DetectorUnavailable(
            "CUDA was requested, but CUDA is unavailable."
        )

    return device


def _download(filename):
    settings = get_settings()

    try:
        return hf_hub_download(
            repo_id=settings.hf_model_repo,
            filename=filename,
            token=os.getenv("HF_TOKEN") or None,
        )
    except Exception as exc:
        raise DetectorUnavailable(
            f"Could not download {filename}. Check the Hugging Face "
            "repository, token and checkpoint filename."
        ) from exc


def _extract_state(checkpoint, name):
    if name == "resnet18":
        if isinstance(checkpoint, dict):
            for key in ("model_state_dict", "state_dict"):
                if key in checkpoint:
                    return checkpoint[key]
        return checkpoint

    if isinstance(checkpoint, dict):
        for key in ("model_state_dict", "state_dict"):
            if key in checkpoint:
                return checkpoint[key]

    raise RuntimeError(f"Unexpected checkpoint format: {name}")


def load_models():
    global _MODELS, _DEVICE

    if _MODELS is not None:
        return _MODELS, _DEVICE

    with _LOCK:
        if _MODELS is not None:
            return _MODELS, _DEVICE

        device = _get_device()
        models = build_models()

        for name, filename in WEIGHTS.items():
            path = _download(filename)

            checkpoint = torch.load(
                path,
                map_location="cpu",
                weights_only=True,
            )

            state = _extract_state(checkpoint, name)
            models[name].load_state_dict(state, strict=True)

            models[name] = models[name].to(device).eval()

            del checkpoint, state

        _MODELS = models
        _DEVICE = device

    return _MODELS, _DEVICE
