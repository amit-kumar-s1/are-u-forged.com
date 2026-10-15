import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import router
from app.core.config import get_settings
from app.core.guard import GuardMiddleware, SecurityHeadersMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log, s = logging.getLogger("aryouforged"), get_settings()
if s.malware_scan_mode == "off": log.warning("MALWARE SCANNING IS DISABLED (MALWARE_SCAN_MODE=off). Uploads are NOT scanned.")
if s.rate_limit_backend == "memory": log.warning("Rate limiting is per-process (memory). Use RATE_LIMIT_BACKEND=redis for multiple workers/instances.")
origins = [o.strip() for o in s.cors_origins.split(",") if o.strip() and o.strip() != "*"]

app = FastAPI(title="Are You Forged API", version="0.2.0",
              docs_url="/docs" if s.docs_enabled else None, redoc_url=None, openapi_url="/openapi.json" if s.docs_enabled else None)
app.include_router(router)
# add_middleware: last added = outermost. CORS outermost so browsers can read 413/429 errors.
app.add_middleware(GuardMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["*"])

@app.get("/health")
def health(): return {"status": "ok"}

@app.exception_handler(HTTPException)
async def http_err(_: Request, exc: HTTPException):
    d = exc.detail if isinstance(exc.detail, dict) else {"code": "error", "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content=d, headers=exc.headers)

@app.exception_handler(RequestValidationError)
async def val_err(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"code": "invalid_request", "message": "Invalid request payload."})

@app.exception_handler(Exception)
async def any_err(_: Request, exc: Exception):
    log.exception("unhandled error")  # details stay in server logs only
    return JSONResponse(status_code=500, content={"code": "internal_error", "message": "Internal server error."})
