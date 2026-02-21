from fastapi import APIRouter, Depends, HTTPException, status
from ..models.schemas import (
    LessonRequest, LessonResponse, LessonContent, QuizContent,
    QuizSubmission, QuizSubmissionResponse, AnalyticsEvent,
)
from ..services import llm_service, analytics_service
from ..core.firebase_auth import get_current_user

router = APIRouter()


@router.post("/generate", response_model=LessonResponse)
async def generate_lesson(body: LessonRequest, user: dict = Depends(get_current_user)):
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
async def submit_quiz(body: QuizSubmission, user: dict = Depends(get_current_user)):
    correct = body.selected_index == body.correct_index

    analytics_service.record_event(
        user["uid"],
        AnalyticsEvent(event_type="quiz_attempted", topic=body.topic, difficulty=body.difficulty,
                       metadata={"correct": correct}),
    )
    if correct:
        analytics_service.record_event(
            user["uid"],
            AnalyticsEvent(event_type="quiz_passed", topic=body.topic, difficulty=body.difficulty),
        )

    try:
        feedback = await llm_service.generate_quiz_feedback(
            body.topic, body.question, body.selected_index, body.correct_index, []
        )
    except Exception:
        feedback = "Great effort! Keep going." if correct else "Keep practising — you'll get it!"

    return QuizSubmissionResponse(correct=correct, explanation=body.question, feedback=feedback)