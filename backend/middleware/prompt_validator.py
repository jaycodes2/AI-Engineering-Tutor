import json
import re
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?", re.I),
    re.compile(r"forget\s+(everything|all)\s+(you|your)", re.I),
    re.compile(r"disregard\s+(your|all)\s+(guidelines|instructions|rules)", re.I),
    re.compile(r"jailbreak", re.I),
    re.compile(r"DAN\s+mode", re.I),
]

_VALIDATED_PREFIXES = ("/api/chat", "/api/lessons")
_MAX_CHARS = 8000

def _extract_text_fields(body: dict) -> list:
    fields = []
    for v in body.values():
        if isinstance(v, str):
            fields.append(v)
        elif isinstance(v, list):
            for item in v:
                if isinstance(item, dict):
                    for vv in item.values():
                        if isinstance(vv, str):
                            fields.append(vv)
    return fields

class PromptValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and any(request.url.path.startswith(p) for p in _VALIDATED_PREFIXES):
            try:
                raw = await request.body()
                body = json.loads(raw) if raw else {}
            except Exception:
                return JSONResponse(status_code=400, content={"detail": "Invalid JSON body."})

            combined = " ".join(_extract_text_fields(body))

            if len(combined) > _MAX_CHARS:
                return JSONResponse(status_code=400, content={"detail": f"Input too long (max {_MAX_CHARS} chars)."})

            for pattern in _INJECTION_PATTERNS:
                if pattern.search(combined):
                    return JSONResponse(status_code=400, content={"detail": "Input contains disallowed content."})

            async def receive():
                return {"type": "http.request", "body": raw}
            request = Request(request.scope, receive)

        return await call_next(request)
