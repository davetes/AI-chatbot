from fastapi import APIRouter, Request
from typing import Any, Dict
from app.services.chat_handler import handle_incoming_message
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
    reply = await handle_incoming_message("telegram", str(chat_id), text)
    await send_telegram_message(str(chat_id), reply)
    return {"status": "ok"}
