from typing import Any, Dict, Optional

from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
