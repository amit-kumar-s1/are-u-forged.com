# Are You Forged.com
Monorepo: `frontend/` (Next.js 14, TS, Tailwind, Framer Motion) and `backend/` (FastAPI). Deployed separately.

## Run locally
```powershell
# Backend (Windows PowerShell)
cd backend; python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt; copy .env.example .env
uvicorn app.main:app --reload --port 8000
# Frontend (new terminal)
cd frontend; copy .env.example .env.local; npm install; npm run dev
```
macOS/Linux: `source .venv/bin/activate`, `cp` instead of `copy`.
URLs: site http://localhost:3000, API http://localhost:8000, Swagger http://localhost:8000/docs.

## Tests
`cd backend && pytest -q` (uses a mock detector; no weights needed). `cd frontend && npm run build`.

## API
- `GET /health`, `GET /api/v1/health` -> `{"status":"ok"}`
- `POST /api/v1/detect/image|video` multipart field `file`; `POST /api/v1/detect/text` JSON `{"text": "..."}`
- 200: `{modality, label: real|fake|inconclusive, fake_probability, confidence|null, model, processing_ms, details, disclaimer}`
- Errors: `{code, message}` (`unsupported_type` 415, `signature_mismatch` 415, `file_too_large` 413, `empty_file` 400, `text_too_short` 422, `text_too_long` 413, `model_not_configured` 503, `inference_failed` 500)

## Models
See `docs/MODEL_INTEGRATION.md`.

## Deploy
- Frontend (Vercel): root dir `frontend`, build `npm run build`, env `NEXT_PUBLIC_API_URL=https://<your-backend>`.
- Backend (Docker host): `docker build -t ayf-backend backend && docker run -p 8000:8000 --env-file backend/.env ayf-backend`. Set `CORS_ORIGINS` to your frontend origin. Health check: `/health`. PyTorch models need RAM/disk beyond most free tiers; videos need more again.

## Add a fourth module
Add an entry to `frontend/src/lib/modules.ts`, a page under `app/detect/<kind>/`, a `Detector` in `backend/app/detectors/<kind>/`, register it, and add a route in `api/routes.py`.

## Security (v0.2)
Details and verification status: `docs/SECURITY.md`. Summary of what the backend now does:
- **Rate limiting** per client IP and per endpoint (`RATE_LIMIT_*_PER_MIN`, window `RATE_LIMIT_WINDOW_S`), enforced in middleware *before* the upload body is read; 429 + `Retry-After`. `RATE_LIMIT_BACKEND=memory` is per-process only; use `redis` (+ `REDIS_URL`) for several workers/instances. `X-Forwarded-For` is ignored unless `TRUSTED_PROXY_COUNT` > 0, and then only the entry added by your outermost trusted proxy is used.
- **Upload size** is enforced on the bytes actually received (not just `Content-Length`), so chunked and lying clients are cut off (413). Files stream in 1 MB chunks into a private temp file (`TEMP_UPLOAD_DIR`, dir 0700, files 0600, random names, client filename never used) and are deleted in a `finally` block on every path. Note: Starlette parses multipart bodies into its own spooled temp file (RAM-bounded, disk-backed above 1 MB), so an upload is *not* a zero-copy stream; disk use is bounded by the size limits.
- **Concurrency**: `MAX_CONCURRENT_UPLOADS`, per-modality `MAX_CONCURRENT_*_INFERENCE`; waiting requests get 503 + `Retry-After` after `QUEUE_WAIT_TIMEOUT_S`. Inference has per-modality timeouts (504). A timed-out worker thread cannot be killed; its slot stays occupied until it finishes.
- **Images** are checked from disk: real format via Pillow, dimension and pixel limits *before* decoding, Pillow's decompression-bomb warning turned into an error (Pillow's global guard is untouched), then re-encoded to PNG and downscaled to `IMAGE_NORMALIZE_MAX_SIDE` before inference (this slightly changes model input versus the original file; models resize to their own input size anyway).
- **Malware scanning** (ClamAV `clamd`, `MALWARE_SCAN_MODE`): `off` (default, **no scanning; responses say `malware_scan: "not_performed"`**), `optional`, `required` (fail closed with 503). Install: `sudo apt install clamav-daemon clamav-freshclam`, run `freshclam`, start `clamd` (TCP 3310 or a unix socket), and set `StreamMaxLength` in `clamd.conf` >= `MAX_VIDEO_MB`. Files go only to your own clamd; nothing is sent to third parties.
- **Headers**: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, restrictive CSP on API responses (not on `/docs`), HSTS only if `ENABLE_HSTS=true`. The frontend sets its own CSP/HSTS in `frontend/next.config.mjs` (HSTS in production builds only). Set `DOCS_ENABLED=false` in production. The Dockerfile runs as non-root with `--no-server-header`.
- **Run security tests**: `cd backend && pytest -q tests/test_security.py`.

### Needed at deployment level (not in this code)
Reverse-proxy/CDN request-body limit and read timeouts (e.g. nginx `client_max_body_size`, `client_body_timeout`), TLS, WAF/DDoS protection, Redis for multi-instance rate limiting, `TRUSTED_PROXY_COUNT` matched to your real proxy chain, `CORS_ORIGINS` set to your real frontend origin, and log retention review.

## Privacy limits
Images processed in memory; videos use a temp file deleted after analysis; contents are not logged. Host/proxy logging is outside this code's control.
