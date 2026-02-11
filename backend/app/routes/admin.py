from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query
from app.models.schemas import AnalyticsResponse, MessageOut
from app.services.db import get_analytics, list_messages

router = APIRouter()

@router.get("/messages", response_model=List[MessageOut])
async def messages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    channel: Optional[str] = None,
) -> List[MessageOut]:
    return await list_messages(limit=limit, offset=offset, channel=channel)

@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics() -> AnalyticsResponse:
    data: Dict[str, Any] = await get_analytics()
    return AnalyticsResponse(**data)
