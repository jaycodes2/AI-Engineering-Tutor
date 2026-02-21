from collections import defaultdict
from datetime import datetime
from typing import Dict, List
from ..models.schemas import AnalyticsEvent, UserStats

_store: Dict[str, List[dict]] = defaultdict(list)

def record_event(uid: str, event: AnalyticsEvent) -> None:
    _store[uid].append({
        "event_type": event.event_type,
        "topic": event.topic,
        "difficulty": event.difficulty.value if event.difficulty else None,
        "metadata": event.metadata or {},
        "timestamp": datetime.utcnow().isoformat(),
    })

def get_user_stats(uid: str) -> UserStats:
    events = _store.get(uid, [])
    total_messages = sum(1 for e in events if e["event_type"] == "message_sent")
    lessons_viewed = sum(1 for e in events if e["event_type"] == "lesson_viewed")
    quizzes_attempted = sum(1 for e in events if e["event_type"] == "quiz_attempted")
    quizzes_passed = sum(1 for e in events if e["event_type"] == "quiz_passed")
    accuracy = round((quizzes_passed / quizzes_attempted) * 100, 1) if quizzes_attempted > 0 else 0.0
    topics = list({e["topic"] for e in events if e.get("topic")})
    recent = sorted(events, key=lambda e: e["timestamp"], reverse=True)[:20]
    return UserStats(
        total_messages=total_messages,
        lessons_viewed=lessons_viewed,
        quizzes_attempted=quizzes_attempted,
        quizzes_passed=quizzes_passed,
        accuracy_pct=accuracy,
        topics_studied=topics,
        recent_events=recent,
    )

def get_all_events(uid: str) -> List[dict]:
    return _store.get(uid, [])
