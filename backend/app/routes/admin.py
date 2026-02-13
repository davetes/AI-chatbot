import os
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from app.config import settings
from app.models.schemas import (
    ABTestRequest,
    ABTestResponse,
    AnalyticsResponse,
    AdvancedAnalyticsResponse,
    AgentReplyRequest,
    BotConfigUpdate,
    BotConfigView,
    ConversationMessageOut,
    ConversationOut,
    EmailReplyRequest,
    EmailReplyResponse,
    HandoffUpdate,
    KnowledgeBaseDoc,
    KnowledgeBaseSearchRequest,
    KnowledgeBaseSearchResponse,
    LeadOut,
    MessageOut,
    SimulationRequest,
    SimulationResponse,
    SettingsUpdate,
    SettingsView,
    WorkflowRule,
    WorkflowRulesUpdate,
)
from app.ai.rag import delete_document, ingest_document, list_documents, retrieve_context
from app.services.email import send_email
from app.services.db import (
    get_advanced_analytics,
    get_analytics,
    get_conversation,
    list_conversations,
    list_leads,
    list_messages,
    list_messages_by_conversation,
    set_handoff,
    add_message,
)
from app.services.env import update_env_file
from app.ai.chatbot import generate_reply
from app.services.messaging import (
    send_instagram_message,
    send_messenger_message,
    send_telegram_message,
    send_whatsapp_message,
)
from app.services.workflows import create_rule, list_rules, save_rules

router = APIRouter()


def require_admin_key(x_admin_key: Optional[str] = Header(default=None)) -> None:
    if settings.admin_api_key and x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/messages", response_model=List[MessageOut], dependencies=[Depends(require_admin_key)])
async def messages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    platform: Optional[str] = None,
) -> List[MessageOut]:
    return await list_messages(limit=limit, offset=offset, platform=platform)

@router.get("/conversations", response_model=List[ConversationOut], dependencies=[Depends(require_admin_key)])
async def conversations(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    platform: Optional[str] = None,
) -> List[ConversationOut]:
    return await list_conversations(limit=limit, offset=offset, platform=platform)

@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=List[ConversationMessageOut],
    dependencies=[Depends(require_admin_key)],
)
async def conversation_messages(conversation_id: int, limit: int = Query(50, ge=1, le=200)) -> List[ConversationMessageOut]:
    return await list_messages_by_conversation(conversation_id, limit=limit)


@router.patch(
    "/conversations/{conversation_id}/handoff",
    dependencies=[Depends(require_admin_key)],
)
async def update_handoff(conversation_id: int, payload: HandoffUpdate) -> Dict[str, bool]:
    await set_handoff(conversation_id, payload.enabled)
    return {"handoff_enabled": payload.enabled}


@router.post(
    "/conversations/{conversation_id}/reply",
    dependencies=[Depends(require_admin_key)],
)
async def agent_reply(conversation_id: int, payload: AgentReplyRequest) -> Dict[str, str]:
    conversation = await get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.platform == "whatsapp":
        await send_whatsapp_message(conversation.user.external_id, payload.message)
    elif conversation.platform == "messenger":
        await send_messenger_message(conversation.user.external_id, payload.message)
    elif conversation.platform == "instagram":
        await send_instagram_message(conversation.user.external_id, payload.message)
    elif conversation.platform == "telegram":
        await send_telegram_message(conversation.user.external_id, payload.message)
    await add_message(conversation_id, sender="agent", content=payload.message)
    return {"status": "sent"}

@router.get("/leads", response_model=List[LeadOut], dependencies=[Depends(require_admin_key)])
async def leads(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> List[LeadOut]:
    return await list_leads(limit=limit, offset=offset)

@router.get("/analytics", response_model=AnalyticsResponse, dependencies=[Depends(require_admin_key)])
async def analytics() -> AnalyticsResponse:
    data: Dict[str, Any] = await get_analytics()
    return AnalyticsResponse(**data)


@router.get("/analytics/advanced", response_model=AdvancedAnalyticsResponse, dependencies=[Depends(require_admin_key)])
async def analytics_advanced() -> AdvancedAnalyticsResponse:
    data: Dict[str, Any] = await get_advanced_analytics()
    return AdvancedAnalyticsResponse(**data)

@router.get("/settings", response_model=SettingsView, dependencies=[Depends(require_admin_key)])
async def get_settings() -> SettingsView:
    return SettingsView(
        ai_provider=settings.ai_provider,
        ai_model=settings.ai_model,
        ai_base_url=settings.ai_base_url or None,
        has_ai_api_key=bool(settings.ai_api_key),
        verify_token_set=bool(settings.verify_token),
        meta_api_version=settings.meta_api_version,
        meta_phone_number_id=settings.meta_phone_number_id or None,
        meta_page_access_token_set=bool(settings.meta_page_access_token),
        meta_access_token_set=bool(settings.meta_access_token),
        telegram_bot_token_set=bool(settings.telegram_bot_token),
        crm_webhook_url=settings.crm_webhook_url or None,
        sheets_webhook_url=settings.sheets_webhook_url or None,
        database_url=settings.database_url or None,
        smtp_host=settings.smtp_host or None,
        smtp_port=settings.smtp_port,
        smtp_user=settings.smtp_user or None,
        smtp_from=settings.smtp_from or None,
        smtp_tls=settings.smtp_tls,
        smtp_configured=bool(settings.smtp_host and settings.smtp_user and settings.smtp_pass),
        bot_persona=settings.bot_persona,
        bot_tone=settings.bot_tone,
        bot_system_prompt=settings.bot_system_prompt or None,
    )

@router.post("/settings", response_model=SettingsView, dependencies=[Depends(require_admin_key)])
async def update_settings(payload: SettingsUpdate) -> SettingsView:
    updates: Dict[str, str] = {}
    mapping = {
        "ai_provider": "AI_PROVIDER",
        "ai_model": "AI_MODEL",
        "ai_base_url": "AI_BASE_URL",
        "ai_api_key": "AI_API_KEY",
        "verify_token": "VERIFY_TOKEN",
        "meta_api_version": "META_API_VERSION",
        "meta_access_token": "META_ACCESS_TOKEN",
        "meta_phone_number_id": "META_PHONE_NUMBER_ID",
        "meta_page_access_token": "META_PAGE_ACCESS_TOKEN",
        "telegram_bot_token": "TELEGRAM_BOT_TOKEN",
        "crm_webhook_url": "CRM_WEBHOOK_URL",
        "sheets_webhook_url": "SHEETS_WEBHOOK_URL",
        "database_url": "DATABASE_URL",
        "smtp_host": "SMTP_HOST",
        "smtp_port": "SMTP_PORT",
        "smtp_user": "SMTP_USER",
        "smtp_pass": "SMTP_PASS",
        "smtp_from": "SMTP_FROM",
        "smtp_tls": "SMTP_TLS",
        "bot_persona": "BOT_PERSONA",
        "bot_tone": "BOT_TONE",
        "bot_system_prompt": "BOT_SYSTEM_PROMPT",
    }

    for field, env_key in mapping.items():
        value = getattr(payload, field)
        if value is not None:
            updates[env_key] = value

    if updates:
        update_env_file(updates)
        for key, value in updates.items():
            os.environ[key] = value
        settings.reload()

    return await get_settings()

@router.post("/email/reply", response_model=EmailReplyResponse, dependencies=[Depends(require_admin_key)])
async def email_reply(payload: EmailReplyRequest) -> EmailReplyResponse:
    reply, _ = await generate_reply(payload.message, channel="email", history=[])
    send_email(payload.to, payload.subject, reply)
    return EmailReplyResponse(reply=reply)


@router.post("/knowledge-base/upload", response_model=KnowledgeBaseDoc, dependencies=[Depends(require_admin_key)])
async def upload_kb(file: UploadFile = File(...)) -> KnowledgeBaseDoc:
    os.makedirs(settings.kb_path, exist_ok=True)
    file_path = os.path.join(settings.kb_path, file.filename)
    with open(file_path, "wb") as handle:
        handle.write(await file.read())
    doc = ingest_document(file.filename, file_path)
    return KnowledgeBaseDoc(**doc)


@router.get("/knowledge-base", response_model=List[KnowledgeBaseDoc], dependencies=[Depends(require_admin_key)])
async def list_kb() -> List[KnowledgeBaseDoc]:
    return [KnowledgeBaseDoc(**doc) for doc in list_documents()]


@router.delete("/knowledge-base/{doc_id}", dependencies=[Depends(require_admin_key)])
async def delete_kb(doc_id: str) -> Dict[str, str]:
    delete_document(doc_id)
    return {"status": "deleted"}


@router.post("/knowledge-base/search", response_model=KnowledgeBaseSearchResponse, dependencies=[Depends(require_admin_key)])
async def search_kb(payload: KnowledgeBaseSearchRequest) -> KnowledgeBaseSearchResponse:
    context = retrieve_context(payload.query)
    results = [chunk for chunk in context.split("\n\n") if chunk]
    return KnowledgeBaseSearchResponse(results=results)


@router.get("/bot/config", response_model=BotConfigView, dependencies=[Depends(require_admin_key)])
async def get_bot_config() -> BotConfigView:
    return BotConfigView(
        persona=settings.bot_persona,
        tone=settings.bot_tone,
        system_prompt=settings.bot_system_prompt or None,
    )


@router.post("/bot/config", response_model=BotConfigView, dependencies=[Depends(require_admin_key)])
async def update_bot_config(payload: BotConfigUpdate) -> BotConfigView:
    updates: Dict[str, str] = {}
    if payload.persona is not None:
        updates["BOT_PERSONA"] = payload.persona
    if payload.tone is not None:
        updates["BOT_TONE"] = payload.tone
    if payload.system_prompt is not None:
        updates["BOT_SYSTEM_PROMPT"] = payload.system_prompt
    if updates:
        update_env_file(updates)
        for key, value in updates.items():
            os.environ[key] = value
        settings.reload()
    return await get_bot_config()


@router.get("/workflows", response_model=List[WorkflowRule], dependencies=[Depends(require_admin_key)])
async def get_workflows() -> List[WorkflowRule]:
    return [WorkflowRule(**rule) for rule in list_rules()]


@router.post("/workflows", response_model=List[WorkflowRule], dependencies=[Depends(require_admin_key)])
async def update_workflows(payload: WorkflowRulesUpdate) -> List[WorkflowRule]:
    rules = [rule.model_dump() for rule in payload.rules]
    save_rules(rules)
    return [WorkflowRule(**rule) for rule in rules]


@router.post("/workflows/create", response_model=WorkflowRule, dependencies=[Depends(require_admin_key)])
async def create_workflow_rule(payload: WorkflowRule) -> WorkflowRule:
    rule = create_rule(payload.name, payload.keywords, payload.action)
    return WorkflowRule(**rule)


@router.get("/reports/export", dependencies=[Depends(require_admin_key)])
async def export_reports(report_type: str = Query("leads")) -> StreamingResponse:
    if report_type == "leads":
        rows = await list_leads(limit=500)
        header = "id,name,phone,email,platform,intent,created_at\n"
        body = "".join(
            f"{row.id},\"{row.name or ''}\",\"{row.phone or ''}\",\"{row.email or ''}\",{row.platform},\"{row.intent or ''}\",{row.created_at.isoformat()}\n"
            for row in rows
        )
    else:
        messages = await list_messages(limit=500)
        header = "id,conversation_id,platform,user_external_id,sender,content,created_at\n"
        body = "".join(
            f"{row['id']},{row['conversation_id']},{row['platform']},\"{row['user_external_id']}\",{row['sender']},\"{row['content'].replace('"','""')}\",{row['created_at']}\n"
            for row in messages
        )
    content = header + body
    return StreamingResponse(iter([content]), media_type="text/csv")


@router.post("/testing/simulate", response_model=SimulationResponse, dependencies=[Depends(require_admin_key)])
async def simulate(payload: SimulationRequest) -> SimulationResponse:
    history: List[Dict[str, str]] = []
    current = payload.prompt
    transcript: List[Dict[str, str]] = []
    for _ in range(max(payload.turns, 1)):
        reply, _ = await generate_reply(current, channel="simulator", history=history)
        transcript.append({"role": "user", "content": current})
        transcript.append({"role": "assistant", "content": reply})
        history.append({"role": "user", "content": current})
        history.append({"role": "assistant", "content": reply})
        current = reply
    return SimulationResponse(transcript=transcript)


@router.post("/testing/ab", response_model=ABTestResponse, dependencies=[Depends(require_admin_key)])
async def ab_test(payload: ABTestRequest) -> ABTestResponse:
    reply_a, _ = await generate_reply(payload.message, channel="ab-test", history=[{"role": "system", "content": payload.prompt_a}])
    reply_b, _ = await generate_reply(payload.message, channel="ab-test", history=[{"role": "system", "content": payload.prompt_b}])
    return ABTestResponse(response_a=reply_a, response_b=reply_b)
