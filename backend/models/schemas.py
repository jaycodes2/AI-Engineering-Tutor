from pydantic import BaseModel, Field, model_validator
from typing import List, Literal, Optional
from enum import Enum


class Difficulty(str, Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    advanced = "Advanced"


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    text: Optional[str] = None
    parts: Optional[List[dict]] = None

    @model_validator(mode="after")
    def resolve_text(self):
        if not self.text and self.parts:
            self.text = " ".join(p.get("text", "") for p in self.parts if isinstance(p, dict))
        if not self.text:
            raise ValueError("Message must have either 'text' or 'parts' with text.")
        return self

    def get_text(self) -> str:
        return self.text or ""


class ChatRequest(BaseModel):
    history: List[ChatMessage] = Field(default_factory=list)
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[str] = None


class TitleSuggestionsRequest(BaseModel):
    history: List[ChatMessage]


class TitleSuggestionsResponse(BaseModel):
    title: str
    topics: List[str]


class LessonRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    difficulty: Difficulty = Difficulty.beginner


class LessonContent(BaseModel):
    title: str
    explanation: str
    image_prompt: str


class QuizContent(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str


class LessonResponse(BaseModel):
    lesson: LessonContent
    quiz: QuizContent


class QuizSubmission(BaseModel):
    topic: str
    difficulty: Difficulty
    question: str
    options: List[str]           # ← NEW: needed by Evaluator Agent
    selected_index: int
    correct_index: int
    time_taken_seconds: Optional[float] = None


class EvaluationResult(BaseModel):
    correct: bool
    partial_credit: float = Field(ge=0.0, le=1.0)
    misconception: Optional[str] = None
    explanation: str
    feedback: str
    hint_for_next: str


class QuizSubmissionResponse(BaseModel):
    correct: bool
    partial_credit: float
    misconception: Optional[str]
    explanation: str
    feedback: str
    hint_for_next: str


class HintRequest(BaseModel):
    topic: str
    question: str
    options: List[str]
    correct_index: int
    hint_level: int = Field(default=1, ge=1, le=4)


class HintResponse(BaseModel):
    hint: str
    level: int
    level_name: str


class AnalyticsEvent(BaseModel):
    event_type: Literal["message_sent", "lesson_viewed", "quiz_attempted", "quiz_passed"]
    topic: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    metadata: Optional[dict] = None


class UserStats(BaseModel):
    total_messages: int = 0
    lessons_viewed: int = 0
    quizzes_attempted: int = 0
    quizzes_passed: int = 0
    accuracy_pct: float = 0.0
    topics_studied: List[str] = Field(default_factory=list)
    recent_events: List[dict] = Field(default_factory=list)