from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from ..models.schemas import ChatRequest, ChatResponse, TitleSuggestionsRequest, TitleSuggestionsResponse, AnalyticsEvent
from ..services import llm_service, analytics_service
from ..core.firebase_auth import get_current_user
from ..middleware.rate_limiter import limiter
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/message")
@limiter.limit("30/minute")
async def send_message(
    request: Request,
    body: ChatRequest,
    user: dict = Depends(get_current_user),
):
    """
    Stream chat response token by token using Server-Sent Events.
    Frontend reads the stream and appends tokens as they arrive.
    """
    async def event_stream():
        try:
            async for token in llm_service.stream_chat_with_tutor(body.history, body.message):
                # SSE format: data: <token>\n\n
                yield f"data: {json.dumps({'token': token})}\n\n"

            # Signal end of stream
            yield f"data: {json.dumps({'done': True})}\n\n"

            # Record analytics after full response
            analytics_service.record_event(
                user["uid"],
                AnalyticsEvent(event_type="message_sent", metadata={"session_id": body.session_id}),
            )
        except Exception as e:
            logger.error("Streaming error: %s", e)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.post("/title", response_model=TitleSuggestionsResponse)
@limiter.limit("20/minute")
async def generate_title(
    request: Request,
    body: TitleSuggestionsRequest,
    user: dict = Depends(get_current_user),
):
    if not body.history:
        raise HTTPException(status_code=400, detail="History cannot be empty.")
    try:
        result = await llm_service.generate_title_and_suggestions(body.history)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")
    return TitleSuggestionsResponse(
        title=result.get("title", "New Chat"),
        topics=result.get("topics", []),
    )