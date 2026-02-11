from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.ai.chatbot import generate_reply
from app.services.db import save_message

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def handle_message(payload: ChatRequest) -> ChatResponse:
    reply = generate_reply(payload.message, channel="webchat")
    await save_message(
        channel="webchat",
        user_message=payload.message,
        bot_message=reply,
        user_id=payload.user_id,
    )
    return ChatResponse(reply=reply)
