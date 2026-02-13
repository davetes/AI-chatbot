from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query
from app.models.schemas import AnalyticsResponse, ConversationMessageOut, ConversationOut, LeadOut, MessageOut
from app.services.db import get_analytics, list_conversations, list_leads, list_messages, list_messages_by_conversation

router = APIRouter()

@router.get("/messages", response_model=List[MessageOut])
async def messages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    platform: Optional[str] = None,
) -> List[MessageOut]:
    return await list_messages(limit=limit, offset=offset, platform=platform)

@router.get("/conversations", response_model=List[ConversationOut])
async def conversations(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    platform: Optional[str] = None,
) -> List[ConversationOut]:
    return await list_conversations(limit=limit, offset=offset, platform=platform)

@router.get("/conversations/{conversation_id}/messages", response_model=List[ConversationMessageOut])
async def conversation_messages(conversation_id: int, limit: int = Query(50, ge=1, le=200)) -> List[ConversationMessageOut]:
    return await list_messages_by_conversation(conversation_id, limit=limit)

@router.get("/leads", response_model=List[LeadOut])
async def leads(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> List[LeadOut]:
    return await list_leads(limit=limit, offset=offset)

@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics() -> AnalyticsResponse:
    data: Dict[str, Any] = await get_analytics()
    return AnalyticsResponse(**data)
