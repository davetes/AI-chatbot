import json
import re
from typing import Dict, List, Optional, Tuple

from app.ai.provider import get_llm_client
from app.ai.rag import retrieve_context
from app.config import settings

SYSTEM_PROMPT = (
    "You are a business chatbot for lead collection. "
    "You must be friendly and concise. "
    "Your goal is to collect lead info: name, phone, email, company, and intent. "
    "If any key info is missing, ask a short follow-up question. "
    "Always answer the user question and guide them toward sharing contact details."
)

EXTRACT_PROMPT = (
    "Extract lead details from the message. "
    "Return ONLY valid JSON with keys: name, phone, email, intent. "
    "Use null for missing fields."
)

async def generate_reply(
    message: str,
    channel: str,
    history: List[Dict[str, str]],
) -> Tuple[str, Optional[Dict[str, Optional[str]]]]:
    context = retrieve_context(message)

    if settings.ai_api_key:
        client, model = get_llm_client()
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "system", "content": f"Channel: {channel}. Context: {context}"},
        ]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        response = await client.chat.completions.create(
            model=model,
            messages=messages,
        )
        reply = response.choices[0].message.content or ""

        extract = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": EXTRACT_PROMPT},
                {"role": "user", "content": message},
            ],
        )
        raw = extract.choices[0].message.content or "{}"
        lead = _safe_json(raw)
        lead = _normalize_lead(lead)
    else:
        reply = f"Echo from {channel}: {message}\nContext: {context}"
        lead = _heuristic_lead(message)

    return reply, lead


def _safe_json(raw: str) -> Dict[str, Optional[str]]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def _normalize_lead(data: Dict[str, Optional[str]]) -> Optional[Dict[str, Optional[str]]]:
    if not data:
        return None
    name = _clean_value(data.get("name"))
    phone = _clean_value(data.get("phone"))
    email = _clean_value(data.get("email"))
    intent = _clean_value(data.get("intent"))

    if not any([name, phone, email, intent]):
        return None
    return {"name": name, "phone": phone, "email": email, "intent": intent}


def _clean_value(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = value.strip()
    return value or None


def _heuristic_lead(message: str) -> Optional[Dict[str, Optional[str]]]:
    name = _match_label(message, "name")
    phone = _match_phone(message)
    email = _match_email(message)
    intent = _match_label(message, "intent")
    if not any([name, phone, email, intent]):
        return None
    return {"name": name, "phone": phone, "email": email, "intent": intent}


def _match_label(message: str, label: str) -> Optional[str]:
    pattern = re.compile(rf"{label}\s*[:=]\s*(.+)", re.IGNORECASE)
    match = pattern.search(message)
    if match:
        return match.group(1).strip()
    return None


def _match_phone(message: str) -> Optional[str]:
    match = re.search(r"(\+?\d[\d\s\-]{7,}\d)", message)
    if match:
        return match.group(1).strip()
    return None


def _match_email(message: str) -> Optional[str]:
    match = re.search(r"[\w\.-]+@[\w\.-]+\.[A-Za-z]{2,}", message)
    if match:
        return match.group(0)
    return None
