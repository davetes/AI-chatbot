from typing import Tuple

from openai import AsyncOpenAI

from app.config import settings


def get_llm_client() -> Tuple[AsyncOpenAI, str]:
    provider = settings.ai_provider.lower()
    api_key = settings.ai_api_key
    base_url = settings.ai_base_url or None

    if not api_key:
        raise RuntimeError("AI_API_KEY is not configured")

    if provider == "groq":
        if not base_url:
            base_url = "https://api.groq.com/openai/v1"
        elif base_url.rstrip("/") == "https://api.groq.com":
            base_url = "https://api.groq.com/openai/v1"

    if provider in {"openai", "groq", "openai-compatible"}:
        if provider != "openai" and not base_url:
            raise RuntimeError("AI_BASE_URL is required for this provider")
        client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        return client, settings.ai_model

    raise RuntimeError(f"Unsupported AI_PROVIDER: {settings.ai_provider}")
