# Connecting your models

Status: **image = adapter written (ResNet-18 v1), weights not included. video + text = pending (return HTTP 503 `model_not_configured`).** Nothing returns fake predictions.

## Image (v1 ResNet-18)
1. `pip install torch torchvision` in the backend venv.
2. Download `DeepFake_Image_Detection_v1.pth` (your Hugging Face repo) to `backend/models/`.
3. Set in `backend/.env`: `IMAGE_MODEL_PATH`, `IMAGE_MODEL_NAME`, `IMAGE_FAKE_CLASS_INDEX`.
4. **Verify against your training code** (`backend/app/detectors/image/detector.py`): the adapter assumes ImageNet mean/std normalisation, 224x224 resize, `fc = Linear(512, 2)`, and that class index 1 = fake (your training class order may differ; set `IMAGE_FAKE_CLASS_INDEX`). Test with images of known labels before trusting output.
5. v2 (EfficientNet-B4 + SE head, 380x380, single sigmoid) and v3 need their own `Detector` subclass: copy the image detector, rebuild the exact architecture, return `RawPrediction(fake_probability=...)`, and register it in `detectors/registry.py`. Your site lists v3's architecture text identical to v2 (DINOv2 is named in the title only), so confirm what v3 actually is.

## Video / Text
Implement `predict(payload)` in `detectors/video/detector.py` (payload = temp file path) or `detectors/text/detector.py` (payload = string), returning `RawPrediction`. Only add progress stages in the frontend (`Workspace.tsx` STAGES) that your pipeline really performs.

## Score semantics
`fake_probability` = model's P(fake/AI). `confidence` = max(p, 1-p), null when |p-0.5| < `INCONCLUSIVE_BAND` (default 0.10, a policy choice, tune it on validation data).
