from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel
from pydantic import ConfigDict

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str

class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sender: str
    content: str
    conversation_id: int
    platform: str
    user_external_id: str
    created_at: datetime

class ConversationOut(BaseModel):
    id: int
    platform: str
    status: str
    user_external_id: str
    created_at: datetime

class ConversationMessageOut(BaseModel):
    id: int
    sender: str
    content: str
    created_at: datetime

class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    platform: str
    intent: Optional[str]
    conversation_id: Optional[int]
    created_at: datetime

class AnalyticsResponse(BaseModel):
    total_messages: int
    channels: Dict[str, int]
    users_by_platform: Dict[str, int]
    conversations_by_platform: Dict[str, int]
    last_24h: int
    total_conversations: int
    total_leads: int

class SettingsView(BaseModel):
    ai_provider: str
    ai_model: str
    ai_base_url: Optional[str]
    has_ai_api_key: bool
    verify_token_set: bool
    meta_api_version: str
    meta_phone_number_id: Optional[str]
    meta_page_access_token_set: bool
    meta_access_token_set: bool
    telegram_bot_token_set: bool
    crm_webhook_url: Optional[str]
    sheets_webhook_url: Optional[str]
    database_url: Optional[str]
    smtp_host: Optional[str]
    smtp_port: Optional[int]
    smtp_user: Optional[str]
    smtp_from: Optional[str]
    smtp_tls: bool
    smtp_configured: bool

class SettingsUpdate(BaseModel):
    ai_provider: Optional[str] = None
    ai_model: Optional[str] = None
    ai_base_url: Optional[str] = None
    ai_api_key: Optional[str] = None
    verify_token: Optional[str] = None
    meta_api_version: Optional[str] = None
    meta_access_token: Optional[str] = None
    meta_phone_number_id: Optional[str] = None
    meta_page_access_token: Optional[str] = None
    telegram_bot_token: Optional[str] = None
    crm_webhook_url: Optional[str] = None
    sheets_webhook_url: Optional[str] = None
    database_url: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None
    smtp_from: Optional[str] = None
    smtp_tls: Optional[bool] = None

class EmailReplyRequest(BaseModel):
    to: str
    subject: str
    message: str

class EmailReplyResponse(BaseModel):
    reply: str
