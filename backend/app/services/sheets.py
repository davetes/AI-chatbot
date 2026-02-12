from typing import Any, Dict

import httpx

from app.config import settings

async def append_row(data: Dict[str, Any]) -> None:
    if not settings.sheets_webhook_url:
        return None
    async with httpx.AsyncClient() as client:
        await client.post(settings.sheets_webhook_url, json=data, timeout=20)
