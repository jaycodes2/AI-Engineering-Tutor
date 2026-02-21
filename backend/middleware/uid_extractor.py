"""
Middleware to extract Firebase UID from token and attach to request.state
so the rate limiter can use it for per-user limits.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import firebase_admin
from firebase_admin import auth as firebase_auth
import logging

logger = logging.getLogger(__name__)


class UIDExtractorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.uid = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                decoded = firebase_auth.verify_id_token(token)
                request.state.uid = decoded.get("uid")
            except Exception:
                pass  # Non-fatal — rate limiter falls back to IP
        return await call_next(request)