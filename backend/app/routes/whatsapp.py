from fastapi import APIRouter, Query, Request
from typing import Any, Dict, List
from app.ai.chatbot import generate_reply
from app.config import settings
from app.services.db import save_message
from app.services.messaging import send_whatsapp_message

router = APIRouter()

@router.get("/webhook")
async def verify_webhook(
    mode: str = Query("", alias="hub.mode"),
    token: str = Query("", alias="hub.verify_token"),
    challenge: str = Query("", alias="hub.challenge"),
):
    if mode == "subscribe" and token == settings.verify_token:
        return int(challenge) if challenge.isdigit() else challenge
    return {"status": "forbidden"}

@router.post("/webhook")
async def receive_message(request: Request) -> Dict[str, Any]:
    payload = await request.json()
    messages: List[Dict[str, Any]] = (
        payload.get("entry", [{}])[0]
        .get("changes", [{}])[0]
        .get("value", {})
        .get("messages", [])
    )
    for message in messages:
        text = message.get("text", {}).get("body")
        sender = message.get("from")
        if not text or not sender:
            continue
        reply = generate_reply(text, channel="whatsapp")
        await save_message(
            channel="whatsapp",
            user_message=text,
            bot_message=reply,
            user_id=sender,
        )
        await send_whatsapp_message(sender, reply)
    return {"status": "ok"}
