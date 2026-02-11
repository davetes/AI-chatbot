from fastapi import APIRouter, Query
from app.models.schemas import ChatRequest, ChatResponse
from app.ai.chatbot import generate_reply
from app.config import settings
from app.services.db import save_message

router = APIRouter()

@router.get("/webhook")
async def verify_webhook(mode: str = Query(""), token: str = Query(""), challenge: str = Query("")):
    if mode == "subscribe" and token == settings.verify_token:
        return int(challenge) if challenge.isdigit() else challenge
    return {"status": "forbidden"}

@router.post("/webhook", response_model=ChatResponse)
async def receive_message(payload: ChatRequest) -> ChatResponse:
    reply = generate_reply(payload.message, channel="messenger")
    await save_message(
        channel="messenger",
        user_message=payload.message,
        bot_message=reply,
        user_id=payload.user_id,
    )
    return ChatResponse(reply=reply)
