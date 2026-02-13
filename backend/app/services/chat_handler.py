from typing import Optional

from app.ai.chatbot import generate_reply
from app.config import settings
from app.services.crm import create_lead as send_crm_lead
from app.services.sheets import append_row as send_sheet_lead
from app.services.db import (
    add_message,
    create_lead,
    get_or_create_conversation,
    get_or_create_user,
    get_recent_messages,
)
from app.services.workflows import match_rules
from app.services.intelligence import classify_intent, extract_entities
from app.services.tools import handle_intent_action
from app.utils.logger import get_logger

logger = get_logger()

async def handle_incoming_message(
    channel: str,
    external_user_id: str,
    text: str,
) -> str:
    tenant_id = settings.default_tenant_id
    user = await get_or_create_user(platform=channel, external_id=external_user_id, tenant_id=tenant_id)
    conversation = await get_or_create_conversation(platform=channel, user_id=user.id, tenant_id=tenant_id)
    history = await get_recent_messages(conversation.id, limit=10, tenant_id=tenant_id)

    await add_message(conversation.id, sender="user", content=text, tenant_id=tenant_id)

    if conversation.handoff_enabled:
        return "Thanks for reaching out. A human agent will respond shortly."

    intent_data = classify_intent(text)
    entities = extract_entities(text)
    action_reply = handle_intent_action(intent_data["intent"], entities, text)

    if action_reply:
        reply, lead = action_reply, None
    else:
        reply, lead = await generate_reply(
            message=text,
            channel=channel,
            history=history,
        )

    rules = match_rules(text)
    for rule in rules:
        action = rule.get("action", "")
        if action.startswith("auto_reply:"):
            reply = action.replace("auto_reply:", "", 1).strip() or reply

    await add_message(conversation.id, sender="bot", content=reply, tenant_id=tenant_id)

    if lead:
        created = await create_lead(
            platform=channel,
            intent=lead.get("intent"),
            name=lead.get("name"),
            phone=lead.get("phone"),
            email=lead.get("email"),
            conversation_id=conversation.id,
            tenant_id=tenant_id,
        )
        lead_payload = {
            "id": created.id,
            "platform": created.platform,
            "name": created.name,
            "phone": created.phone,
            "email": created.email,
            "intent": created.intent,
            "conversation_id": created.conversation_id,
            "created_at": created.created_at.isoformat(),
        }
        logger.info("Lead captured: %s", lead_payload)
        await send_crm_lead(lead_payload)
        await send_sheet_lead(lead_payload)

    return reply
