from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.ai.chatbot import generate_reply
from app.services.db import save_message

router = APIRouter()

@router.post("/webhook", response_model=ChatResponse)
async def receive_message(payload: ChatRequest) -> ChatResponse:
    reply = generate_reply(payload.message, channel="telegram")
    await save_message(
        channel="telegram",
        user_message=payload.message,
        bot_message=reply,
        user_id=payload.user_id,
    )
    return ChatResponse(reply=reply)
