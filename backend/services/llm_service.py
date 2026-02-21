"""
LLM Orchestration Service — using Groq (free tier, fast inference)
Models: llama-3.1-8b-instant (fast) or llama-3.3-70b-versatile (smarter)
"""
import json
import logging
from typing import List
from groq import AsyncGroq
from ..core.config import settings
from ..models.schemas import ChatMessage

logger = logging.getLogger(__name__)

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

SYSTEM_INSTRUCTION = (
    "You are an AI Engineering tutor. You are patient, encouraging, and an expert "
    "in all engineering fields. Your name is 'Cognite'. You provide clear, concise "
    "explanations and always try to motivate the student. When a student asks a "
    "question, answer it directly and then ask a follow-up question to check their understanding."
)

LESSON_SYSTEM_PROMPT = """You are an expert engineering tutor. Always respond with valid JSON only, no markdown, no explanation outside the JSON.
Return exactly this structure:
{
  "lesson": {
    "title": "string",
    "explanation": "string (markdown formatted)",
    "imagePrompt": "string"
  },
  "quiz": {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswerIndex": 0,
    "explanation": "string"
  }
}"""


def _history_to_groq(history: List[ChatMessage]) -> list:
    return [
        {"role": msg.role if msg.role != "model" else "assistant",
         "content": msg.get_text()}
        for msg in history[-20:]
    ]


async def chat_with_tutor(history: List[ChatMessage], message: str) -> str:
    messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
    messages += _history_to_groq(history)
    messages.append({"role": "user", "content": message})

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error("Groq chat error: %s", e)
        raise


async def generate_lesson_and_quiz(topic: str, difficulty: str) -> dict:
    prompt = (
        f'Generate a lesson and quiz about "{topic}" for an engineering student '
        f'at the "{difficulty}" level. Use analogies. Quiz must have exactly 4 options. '
        f'Respond with JSON only.'
    )

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": LESSON_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2048,
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        text = response.choices[0].message.content
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse lesson JSON: %s", e)
        raise ValueError("LLM returned malformed JSON for lesson/quiz.")
    except Exception as e:
        logger.error("Groq lesson error: %s", e)
        raise


async def generate_title_and_suggestions(history: List[ChatMessage]) -> dict:
    conversation = "\n".join(f"{m.role}: {m.get_text()}" for m in history[-10:])
    prompt = (
        f"Based on this conversation, generate a short title (3-5 words) and "
        f"suggest 3-4 related engineering topics. Respond with JSON only.\n\n"
        f"Conversation:\n{conversation}\n\n"
        f'Return: {{"title": "string", "topics": ["string"]}}'
    )

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=256,
            temperature=0.5,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logger.error("Title/suggestion error: %s", e)
        raise


async def generate_quiz_feedback(topic: str, question: str, selected_index: int,
                                  correct_index: int, options: List[str]) -> str:
    correct = selected_index == correct_index
    status = "correctly" if correct else "incorrectly"
    prompt = (
        f"A student answered a quiz about '{topic}' {status}.\n"
        f"Question: {question}\n"
        f"Write 1-2 encouraging sentences of feedback."
    )

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.warning("Feedback generation error: %s", e)
        return "Great effort! Keep going." if correct else "Keep practising — you'll get it!"


async def stream_chat_with_tutor(history, message: str):
    """
    Stream chat response token by token using Groq's streaming API.
    Yields text chunks as they arrive.
    """
    messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
    messages += _history_to_groq(history)
    messages.append({"role": "user", "content": message})

    try:
        stream = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
            stream=True,
        )
        async for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token
    except Exception as e:
        logger.error("Groq streaming error: %s", e)
        raise