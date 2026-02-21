from fastapi import APIRouter, Depends
from ..models.schemas import AnalyticsEvent, UserStats
from ..services import analytics_service
from ..core.firebase_auth import get_current_user
from typing import List

router = APIRouter()

@router.post("/event", status_code=204)
async def record_event(body: AnalyticsEvent, user: dict = Depends(get_current_user)):
    analytics_service.record_event(user["uid"], body)

@router.get("/stats", response_model=UserStats)
async def get_stats(user: dict = Depends(get_current_user)):
    return analytics_service.get_user_stats(user["uid"])

@router.get("/events", response_model=List[dict])
async def get_events(user: dict = Depends(get_current_user)):
    return analytics_service.get_all_events(user["uid"])
