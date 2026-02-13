import os
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query
from app.config import settings
from app.models.schemas import (
    AnalyticsResponse,
    ConversationMessageOut,
    ConversationOut,
    LeadOut,
    MessageOut,
    SettingsUpdate,
    SettingsView,
)
from app.services.db import get_analytics, list_conversations, list_leads, list_messages, list_messages_by_conversation
from app.services.env import update_env_file

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

@router.get("/settings", response_model=SettingsView)
async def get_settings() -> SettingsView:
    return SettingsView(
        ai_provider=settings.ai_provider,
        ai_model=settings.ai_model,
        ai_base_url=settings.ai_base_url or None,
        has_ai_api_key=bool(settings.ai_api_key),
        verify_token_set=bool(settings.verify_token),
        meta_api_version=settings.meta_api_version,
        meta_phone_number_id=settings.meta_phone_number_id or None,
        meta_page_access_token_set=bool(settings.meta_page_access_token),
        meta_access_token_set=bool(settings.meta_access_token),
        telegram_bot_token_set=bool(settings.telegram_bot_token),
        crm_webhook_url=settings.crm_webhook_url or None,
        sheets_webhook_url=settings.sheets_webhook_url or None,
        database_url=settings.database_url or None,
    )

@router.post("/settings", response_model=SettingsView)
async def update_settings(payload: SettingsUpdate) -> SettingsView:
    updates: Dict[str, str] = {}
    mapping = {
        "ai_provider": "AI_PROVIDER",
        "ai_model": "AI_MODEL",
        "ai_base_url": "AI_BASE_URL",
        "ai_api_key": "AI_API_KEY",
        "verify_token": "VERIFY_TOKEN",
        "meta_api_version": "META_API_VERSION",
        "meta_access_token": "META_ACCESS_TOKEN",
        "meta_phone_number_id": "META_PHONE_NUMBER_ID",
        "meta_page_access_token": "META_PAGE_ACCESS_TOKEN",
        "telegram_bot_token": "TELEGRAM_BOT_TOKEN",
        "crm_webhook_url": "CRM_WEBHOOK_URL",
        "sheets_webhook_url": "SHEETS_WEBHOOK_URL",
        "database_url": "DATABASE_URL",
    }

    for field, env_key in mapping.items():
        value = getattr(payload, field)
        if value is not None:
            updates[env_key] = value

    if updates:
        update_env_file(updates)
        for key, value in updates.items():
            os.environ[key] = value
        settings.reload()

    return await get_settings()
