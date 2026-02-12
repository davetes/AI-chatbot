from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_handler import handle_incoming_message

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def handle_message(payload: ChatRequest) -> ChatResponse:
    user_id = payload.user_id or "web-anon"
    reply = await handle_incoming_message("webchat", user_id, payload.message)
    return ChatResponse(reply=reply)
