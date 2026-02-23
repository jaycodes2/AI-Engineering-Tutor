from fastapi import APIRouter, Depends, HTTPException, Request
from ..models.schemas import (
    LessonRequest, LessonResponse, LessonContent, QuizContent,
    QuizSubmission, QuizSubmissionResponse,
    HintRequest, HintResponse,
    AnalyticsEvent,
)
from ..services import llm_service, analytics_service
from ..core.firebase_auth import get_current_user
from ..middleware.rate_limiter import limiter

router = APIRouter()


@router.post("/generate", response_model=LessonResponse)
@limiter.limit("20/minute")
async def generate_lesson(
    request: Request,
    body: LessonRequest,
    user: dict = Depends(get_current_user)
):
    try:
        data = await llm_service.generate_lesson_and_quiz(body.topic, body.difficulty.value)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    analytics_service.record_event(
        user["uid"],
        AnalyticsEvent(event_type="lesson_viewed", topic=body.topic, difficulty=body.difficulty),
    )

    return LessonResponse(
        lesson=LessonContent(
            title=data["lesson"]["title"],
            explanation=data["lesson"]["explanation"],
            image_prompt=data["lesson"]["imagePrompt"],
        ),
        quiz=QuizContent(
            question=data["quiz"]["question"],
            options=data["quiz"]["options"],
            correct_answer_index=data["quiz"]["correctAnswerIndex"],
            explanation=data["quiz"]["explanation"],
        ),
    )


@router.post("/quiz/submit", response_model=QuizSubmissionResponse)
@limiter.limit("30/minute")
async def submit_quiz(
    request: Request,
    body: QuizSubmission,
    user: dict = Depends(get_current_user)
):
    # Run Evaluator Agent
    try:
        evaluation = await llm_service.evaluate_quiz_answer(
            topic=body.topic,
            question=body.question,
            options=body.options,
            selected_index=body.selected_index,
            correct_index=body.correct_index,
            difficulty=body.difficulty.value,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Evaluator error: {str(e)}")

    # Record analytics
    analytics_service.record_event(
        user["uid"],
        AnalyticsEvent(
            event_type="quiz_attempted",
            topic=body.topic,
            difficulty=body.difficulty,
            metadata={
                "correct": evaluation["correct"],
                "partial_credit": evaluation.get("partial_credit", 0),
                "misconception": evaluation.get("misconception"),
            }
        ),
    )
    if evaluation["correct"]:
        analytics_service.record_event(
            user["uid"],
            AnalyticsEvent(event_type="quiz_passed", topic=body.topic, difficulty=body.difficulty),
        )

    return QuizSubmissionResponse(
        correct=evaluation["correct"],
        partial_credit=evaluation.get("partial_credit", 1.0 if evaluation["correct"] else 0.0),
        misconception=evaluation.get("misconception"),
        explanation=evaluation.get("explanation", ""),
        feedback=evaluation.get("feedback", ""),
        hint_for_next=evaluation.get("hint_for_next", ""),
    )


@router.post("/hint", response_model=HintResponse)
@limiter.limit("30/minute")
async def get_hint(
    request: Request,
    body: HintRequest,
    user: dict = Depends(get_current_user)
):
    try:
        hint = await llm_service.generate_hint(
            topic=body.topic,
            question=body.question,
            options=body.options,
            correct_index=body.correct_index,
            hint_level=body.hint_level,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hint error: {str(e)}")

    return HintResponse(
        hint=hint.get("hint", "Think carefully about the core concept."),
        level=hint.get("level", body.hint_level),
        level_name=hint.get("level_name", "conceptual_nudge"),
    )