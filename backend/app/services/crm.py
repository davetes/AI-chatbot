from typing import Any, Dict

import httpx

from app.config import settings

async def create_lead(data: Dict[str, Any]) -> None:
    if not settings.crm_webhook_url:
        return None
    async with httpx.AsyncClient() as client:
        await client.post(settings.crm_webhook_url, json=data, timeout=20)
