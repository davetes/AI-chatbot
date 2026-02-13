import re
from typing import Dict, Optional


def _match_order_id(text: str) -> Optional[str]:
    match = re.search(r"\bORD-\d{4,}\b|\b#\d{4,}\b", text, re.IGNORECASE)
    return match.group(0) if match else None


def handle_intent_action(intent: str, entities: Dict[str, list[str]], message: str) -> Optional[str]:
    if intent == "booking":
        if entities.get("dates"):
            return f"I can book an appointment on {entities['dates'][0]}. Does that work for you?"
        return "Sure — what date works best for you?"

    if intent == "order_status":
        order_id = _match_order_id(message)
        if order_id:
            return f"Thanks! I'm checking the status for {order_id}. I'll update you shortly."
        return "Please share your order ID (e.g., ORD-1234) so I can check the status."

    if intent == "refund":
        return "I can help with a refund. Please share your order ID and reason."

    if intent == "pricing":
        return "I can provide pricing details. Which plan or service are you interested in?"

    return None
