from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .routers import chat, lessons, analytics
from .middleware.prompt_validator import PromptValidationMiddleware
from .middleware.uid_extractor import UIDExtractorMiddleware
from .middleware.rate_limiter import limiter, rate_limit_exceeded_handler
from .core.config import settings

app = FastAPI(
    title="AI Engineering Tutor API",
    description="Backend for LLM orchestration, tutoring logic, quizzes, and learning analytics.",
    version="1.0.0",
)

# Attach limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Middleware (order matters — last added runs first)
app.add_middleware(PromptValidationMiddleware)
app.add_middleware(UIDExtractorMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["Lessons & Quizzes"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}