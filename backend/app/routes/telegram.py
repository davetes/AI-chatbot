from fastapi import APIRouter, Request
from typing import Any, Dict
from app.ai.chatbot import generate_reply
from app.services.db import save_message
from app.services.messaging import send_telegram_message

router = APIRouter()

@router.post("/webhook")
async def receive_message(request: Request) -> Dict[str, Any]:
    payload = await request.json()
    message = payload.get("message", {})
    text = message.get("text")
    chat_id = message.get("chat", {}).get("id")
    if not text or not chat_id:
        return {"status": "ignored"}
    reply = generate_reply(text, channel="telegram")
    await save_message(
        channel="telegram",
        user_message=text,
        bot_message=reply,
        user_id=str(chat_id),
    )
    await send_telegram_message(str(chat_id), reply)
    return {"status": "ok"}
