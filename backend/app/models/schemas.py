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
    channel: str
    user_id: Optional[str]
    user_message: str
    bot_message: str
    created_at: datetime

class AnalyticsResponse(BaseModel):
    total_messages: int
    channels: Dict[str, int]
    last_24h: int
