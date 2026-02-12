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
    last_24h: int
    total_conversations: int
    total_leads: int
