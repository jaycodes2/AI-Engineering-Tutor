"""
Rate Limiting Middleware using slowapi.
Limits per user (by Firebase UID from token) or by IP as fallback.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse


def get_user_identifier(request: Request) -> str:
    """Use Firebase UID if available, fall back to IP."""
    uid = getattr(request.state, "uid", None)
    if uid:
        return f"user:{uid}"
    return get_remote_address(request)


# Global limiter instance — import this in routers
limiter = Limiter(key_func=get_user_identifier)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded. Try again in a moment.",
            "retry_after": str(exc.retry_after) if hasattr(exc, "retry_after") else "60"
        }
    )