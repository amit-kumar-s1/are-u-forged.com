from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- app / CORS ---
    cors_origins: str = "http://localhost:3000"
    docs_enabled: bool = True            # set false in production to hide /docs, /redoc, /openapi.json
    enable_hsts: bool = False            # true ONLY behind correctly configured HTTPS
    # --- size limits ---
    max_image_mb: int = 10
    max_video_mb: int = 100
    max_text_chars: int = 20000
    min_text_chars: int = 50
    # --- image safety ---
    max_image_pixels: int = 40_000_000   # decoded pixels (w*h)
    max_image_dimension: int = 10000     # max width or height
    image_normalize_max_side: int = 2048 # accepted images are downscaled to this before inference
    # --- temp storage ---
    temp_upload_dir: str = ""            # default: <system tmp>/ayf-uploads
    # --- rate limiting (per client IP, per endpoint) ---
    rate_limit_image_per_min: int = 20
    rate_limit_video_per_min: int = 5
    rate_limit_text_per_min: int = 30
    rate_limit_window_s: int = 60
    rate_limit_backend: Literal["memory", "redis"] = "memory"
    redis_url: str = ""                  # e.g. redis://redis:6379/0 (required for multi-worker/instance deployments)
    trusted_proxy_count: int = 0         # number of reverse proxies in front; 0 = ignore X-Forwarded-For entirely
    # --- concurrency / timeouts ---
    max_concurrent_uploads: int = 4
    max_concurrent_image_inference: int = 2
    max_concurrent_video_inference: int = 1
    max_concurrent_text_inference: int = 2
    queue_wait_timeout_s: float = 5.0    # how long a request may wait for an inference slot before 503
    inference_timeout_image_s: float = 30
    inference_timeout_video_s: float = 300
    inference_timeout_text_s: float = 30
    # --- malware scanning (ClamAV clamd) ---
    malware_scan_mode: Literal["off", "optional", "required"] = "off"
    clamd_host: str = "127.0.0.1"
    clamd_port: int = 3310
    clamd_socket: str = ""               # unix socket path; overrides host/port when set
    scan_timeout_s: float = 30
    # --- model ---
    inconclusive_band: float = 0.10
    hf_model_repo: str = "not-human-s1/areyouforged.com"
    image_fake_threshold: float = 0.40
    device: str = "auto"
    image_model_path: str = ""
    image_model_name: str = "Image model"
    image_fake_class_index: int = 1
    device: str = "cpu"

@lru_cache
def get_settings() -> Settings:
    return Settings()
