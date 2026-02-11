from fastapi import APIRouter, Query, Request
from typing import Any, Dict, List

from app.ai.chatbot import generate_reply
from app.config import settings
from app.services.db import save_message
from app.services.messaging import send_instagram_message

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
    messaging_events: List[Dict[str, Any]] = payload.get("entry", [{}])[0].get("messaging", [])
    for event in messaging_events:
        message = event.get("message", {})
        text = message.get("text")
        sender = event.get("sender", {}).get("id")
        if not text or not sender:
            continue
        reply = generate_reply(text, channel="instagram")
        await save_message(
            channel="instagram",
            user_message=text,
            bot_message=reply,
            user_id=sender,
        )
        await send_instagram_message(sender, reply)
    return {"status": "ok"}
