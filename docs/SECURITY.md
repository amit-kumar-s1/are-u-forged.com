# Security verification report (v0.2)

Legend: **Tested** = automated test executed and passed in this environment. **Live-checked** = verified manually against a running server. **Not verified** = implemented/documented but not exercised.

| Area | Implemented | Verification |
|---|---|---|
| Rate limiting (per IP, per endpoint, before body read, 429 + Retry-After) | Yes | Tested; limits apply to uploads; XFF spoofing ignored unless trusted proxies configured (tested) |
| Shared limiter across workers | Redis fixed-window backend | Tested only with a **simulated** shared store (fake Redis). **Not verified** against a real Redis or real multiple processes |
| Redis outage | Falls back to per-process limiter + warning | Tested |
| Security headers (API) | Yes | Tested + Live-checked (uvicorn) |
| Security headers/CSP (frontend) | `next.config.mjs` | Live-checked on `next start` (headers present on `/` and `/detect/image`). **Not verified in a browser**: no browser was available, so confirm in DevTools that fonts, previews, animations and API calls show no CSP violations |
| Malware scanning (clamd INSTREAM client, off/optional/required) | Yes | Tested against a **fake clamd TCP server** (clean, FOUND, timeout, size-limit error, unreachable) and mock scanners (reject, fail-closed, never reports "clean" without a scan, temp cleanup). **Not verified against real ClamAV** (signature database could not be downloaded here) |
| Decompression bombs / malformed images | Yes | Tested: valid JPEG/PNG/WEBP, truncated, junk, extension/signature mismatch, dimension limit, pixel limit, 12000x12000 bomb rejected before decode, Pillow's own guard active, normalisation |
| Bounded-memory uploads | Chunked ingest with byte counter; middleware byte counting | Tested + Live-checked: 30 MB upload with Content-Length -> 413 immediately; 30 MB chunked multipart without Content-Length -> 413; temp dir empty afterwards |
| Concurrency bounds / load shedding | Upload + per-modality gates, queue timeout, inference timeouts | Tested (gate unit tests, 503 busy, 504 timeout) |
| Temp-file cleanup | `finally` on all paths | Tested for success, rejection, exceptions, timeouts, asyncio cancellation. Real client-disconnect mid-upload **not** separately tested |
| Generic 500s, no stack traces | Yes | Tested |
| Dependencies | Backend upgraded (FastAPI 0.143.2, Starlette 1.8.0, Pillow 12.3.0, python-multipart 0.0.32...) | `pip-audit`: no known vulnerabilities in `requirements.txt`. Frontend upgraded to Next 16.4.1 / React 19; `npm audit` still reports 8 findings (2 moderate, 6 high) in the Tailwind 3 build-time toolchain (braces, micromatch, fast-glob, postcss...), not shipped to browsers; the fix is Tailwind 4 (config migration), not done |
| Real-model inference after refactor | Unchanged adapter | Existing 8 tests pass; real weights **not** available here, so real inference was not run |

## Known limitations
- Scanning does not prove content is safe or genuine; it is one layer.
- No authentication or per-user quotas: limits are per IP (shared IPs/NAT share a bucket; attackers with many IPs can exceed per-IP limits). Put a CDN/WAF in front.
- Starlette buffers the multipart body to a spooled temp file before the handler runs; RAM is bounded, disk is bounded by size limits.
- Python threads cannot be killed: a timed-out inference keeps its slot until it finishes.
- Frontend CSP needs `'unsafe-inline'` for scripts (Next.js inline bootstrap, no nonces). Nonce-based CSP is a possible hardening step.
- Frontend checks (file size/type, disabled buttons) are convenience only; all enforcement is on the backend.
