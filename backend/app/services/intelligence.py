import re
from typing import Dict, List

from app.ai.chatbot import generate_reply


INTENT_KEYWORDS = {
    "pricing": ["price", "pricing", "cost", "quote"],
    "support": ["help", "support", "issue", "problem"],
    "refund": ["refund", "chargeback", "return"],
    "booking": ["book", "schedule", "appointment"],
    "order_status": ["order", "tracking", "shipment", "status"],
}


def classify_intent(text: str) -> Dict[str, object]:
    lowered = text.lower()
    best_intent = "general"
    best_score = 0
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(keyword in lowered for keyword in keywords)
        if score > best_score:
            best_score = score
            best_intent = intent
    confidence = min(0.95, 0.4 + 0.15 * best_score) if best_score > 0 else 0.35
    return {"intent": best_intent, "confidence": round(confidence, 2)}


def extract_entities(text: str) -> Dict[str, List[str]]:
    dates = re.findall(r"\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b", text)
    amounts = re.findall(r"\$\d+(?:\.\d{2})?", text)
    products = re.findall(r"\b[A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)*\b", text)
    return {
        "dates": list(dict.fromkeys(dates)),
        "amounts": list(dict.fromkeys(amounts)),
        "products": list(dict.fromkeys(products))[:5],
    }


def summarize(text: str) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    if not sentences:
        return ""
    return " ".join(sentences[:2])


def suggest_responses(intent: str) -> List[str]:
    presets = {
        "pricing": ["I can help with pricing. What plan are you interested in?"],
        "support": ["Sorry about that issue. Can you share more details?"],
        "refund": ["I can help with a refund request. Do you have an order ID?"],
        "booking": ["Happy to schedule. What time works best for you?"],
        "order_status": ["Please share your order number so I can check status."],
        "general": ["How can I help you today?"],
    }
    return presets.get(intent, presets["general"])


async def summarize_conversation(history: List[dict]) -> str:
    content = " ".join(item.get("content", "") for item in history[-6:])
    if not content:
        return ""
    return summarize(content)


async def suggested_agent_reply(message: str) -> str:
    reply, _ = await generate_reply(message, channel="agent", history=[])
    return reply
