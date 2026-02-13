from typing import Any, Dict

import httpx

from app.config import settings

async def send_whatsapp_message(to: str, text: str) -> None:
    if not settings.meta_access_token or not settings.meta_phone_number_id:
        raise RuntimeError("META_ACCESS_TOKEN or META_PHONE_NUMBER_ID is not configured")
    url = f"https://graph.facebook.com/{settings.meta_api_version}/{settings.meta_phone_number_id}/messages"
    payload: Dict[str, Any] = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text},
    }
    headers = {"Authorization": f"Bearer {settings.meta_access_token}"}
    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload, headers=headers, timeout=20)

async def send_messenger_message(recipient_id: str, text: str) -> None:
    if not settings.meta_page_access_token:
        raise RuntimeError("META_PAGE_ACCESS_TOKEN is not configured")
    url = f"https://graph.facebook.com/{settings.meta_api_version}/me/messages"
    payload: Dict[str, Any] = {
        "recipient": {"id": recipient_id},
        "message": {"text": text},
    }
    params = {"access_token": settings.meta_page_access_token}
    async with httpx.AsyncClient() as client:
        await client.post(url, params=params, json=payload, timeout=20)

async def send_instagram_message(recipient_id: str, text: str) -> None:
    if not settings.meta_page_access_token:
        raise RuntimeError("META_PAGE_ACCESS_TOKEN is not configured")
    url = f"https://graph.facebook.com/{settings.meta_api_version}/me/messages"
    payload: Dict[str, Any] = {
        "recipient": {"id": recipient_id},
        "message": {"text": text},
    }
    params = {"access_token": settings.meta_page_access_token}
    async with httpx.AsyncClient() as client:
        await client.post(url, params=params, json=payload, timeout=20)

async def send_telegram_message(chat_id: str, text: str) -> None:
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not configured")
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload, timeout=20)


async def send_sms_message(to: str, text: str) -> None:
    if not (settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number):
        raise RuntimeError("Twilio SMS is not configured")
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    payload = {"From": settings.twilio_from_number, "To": to, "Body": text}
    async with httpx.AsyncClient() as client:
        await client.post(url, data=payload, auth=(settings.twilio_account_sid, settings.twilio_auth_token), timeout=20)
