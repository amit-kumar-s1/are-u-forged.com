"""Pure-ASGI middleware. Runs BEFORE the multipart body is parsed, so limits apply to the raw upload stream."""
import json, re
from starlette.concurrency import run_in_threadpool
from app.core import limits
from app.core.config import get_settings

PATH = re.compile(r"^/api/v1/detect/(image|video|text)$")
OVERHEAD = 256 * 1024  # multipart framing allowance

class BodyTooLarge(Exception): pass

async def reply(send, status, code, message, extra=None):
    body = json.dumps({"code": code, "message": message}).encode()
    h = [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())]
    h += [(k.lower().encode(), str(v).encode()) for k, v in (extra or {}).items()]
    await send({"type": "http.response.start", "status": status, "headers": h})
    await send({"type": "http.response.body", "body": body})

def body_limit(kind: str) -> int:
    s = get_settings()
    return {"image": s.max_image_mb * 1048576 + OVERHEAD, "video": s.max_video_mb * 1048576 + OVERHEAD,
            "text": s.max_text_chars * 4 + 8192}[kind]  # UTF-8 worst case

class GuardMiddleware:
    def __init__(self, app): self.app = app
    async def __call__(self, scope, receive, send):
        m = PATH.match(scope.get("path", "")) if scope["type"] == "http" and scope["method"] == "POST" else None
        if not m: return await self.app(scope, receive, send)
        kind, limit = m.group(1), body_limit(m.group(1))
        ok, retry = await run_in_threadpool(limits.check_rate, kind, limits.client_ip(scope))
        if not ok:
            return await reply(send, 429, "rate_limited", "Too many requests. Please wait and try again.", {"Retry-After": retry})
        cl = dict(scope["headers"]).get(b"content-length")
        if cl and cl.isdigit() and int(cl) > limit:  # early reject; never trusted as the only check
            return await reply(send, 413, "request_too_large", "Upload exceeds the size limit.")
        gate = limits.get_gate("upload")
        if not gate.acquire_nowait():
            return await reply(send, 503, "server_busy", "Too many uploads in progress. Try again shortly.", {"Retry-After": 5})
        started, total, exceeded = False, 0, False
        async def send_w(msg):
            nonlocal started
            if exceeded:  # FastAPI may turn our abort into a generic 400; replace whatever the app sends with a 413
                if not started:
                    started = True
                    await reply(send, 413, "request_too_large", "Upload exceeds the size limit.")
                return
            if msg["type"] == "http.response.start": started = True
            await send(msg)
        async def recv():
            nonlocal total, exceeded
            msg = await receive()
            if msg["type"] == "http.request":
                total += len(msg.get("body", b""))
                if total > limit:  # enforced on bytes actually received (chunked or lying Content-Length)
                    exceeded = True
                    raise BodyTooLarge
            return msg
        try:
            await self.app(scope, recv, send_w)
        except BodyTooLarge:
            pass
        finally:
            gate.release()
        if exceeded and not started:
            await reply(send, 413, "request_too_large", "Upload exceeds the size limit.")

class SecurityHeadersMiddleware:
    DOCS = ("/docs", "/redoc", "/openapi.json")
    def __init__(self, app): self.app = app
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http": return await self.app(scope, receive, send)
        s, path = get_settings(), scope["path"]
        async def send_w(msg):
            if msg["type"] == "http.response.start":
                h = [(k, v) for k, v in msg["headers"] if k.lower() not in (b"server", b"x-powered-by")]
                have = {k.lower() for k, _ in h}
                add = {b"x-content-type-options": b"nosniff", b"x-frame-options": b"DENY",
                       b"referrer-policy": b"strict-origin-when-cross-origin",
                       b"permissions-policy": b"camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"}
                if not path.startswith(self.DOCS):  # Swagger UI needs CDN scripts; API JSON does not
                    add[b"content-security-policy"] = b"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
                if path.startswith("/api/"): add[b"cache-control"] = b"no-store"
                if s.enable_hsts: add[b"strict-transport-security"] = b"max-age=31536000; includeSubDomains"
                h += [(k, v) for k, v in add.items() if k not in have]
                msg = {**msg, "headers": h}
            await send(msg)
        await self.app(scope, receive, send_w)
