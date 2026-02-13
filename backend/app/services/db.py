from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.models.db import Base, Conversation, Lead, Message, User

_engine: Optional[AsyncEngine] = None
_sessionmaker: Optional[async_sessionmaker[AsyncSession]] = None

def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        if not settings.database_url:
            raise RuntimeError("DATABASE_URL is not configured")
        _engine = create_async_engine(settings.database_url, echo=False)
    return _engine

def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _sessionmaker

async def init_db() -> None:
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_or_create_user(platform: str, external_id: str) -> User:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = select(User).where(User.platform == platform, User.external_id == external_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            return user
        user = User(platform=platform, external_id=external_id)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

async def get_or_create_conversation(platform: str, user_id: int) -> Conversation:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id, Conversation.platform == platform, Conversation.status == "open")
            .order_by(Conversation.created_at.desc())
        )
        result = await session.execute(stmt)
        conversation = result.scalars().first()
        if conversation:
            return conversation
        conversation = Conversation(user_id=user_id, platform=platform, status="open")
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)
        return conversation

async def add_message(conversation_id: int, sender: str, content: str) -> Message:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        message = Message(conversation_id=conversation_id, sender=sender, content=content)
        session.add(message)
        await session.commit()
        await session.refresh(message)
        return message

async def list_messages(
    limit: int = 50,
    offset: int = 0,
    platform: Optional[str] = None,
) -> List[Dict[str, object]]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = (
            select(
                Message.id,
                Message.sender,
                Message.content,
                Message.created_at,
                Conversation.id.label("conversation_id"),
                Conversation.platform.label("platform"),
                User.external_id.label("user_external_id"),
            )
            .join(Conversation, Message.conversation_id == Conversation.id)
            .join(User, Conversation.user_id == User.id)
            .order_by(Message.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        if platform:
            stmt = stmt.where(Conversation.platform == platform)
        result = await session.execute(stmt)
        return [
            {
                "id": row.id,
                "sender": row.sender,
                "content": row.content,
                "created_at": row.created_at,
                "conversation_id": row.conversation_id,
                "platform": row.platform,
                "user_external_id": row.user_external_id,
            }
            for row in result
        ]

async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    platform: Optional[str] = None,
) -> List[Dict[str, object]]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = (
            select(
                Conversation.id,
                Conversation.platform,
                Conversation.status,
                Conversation.created_at,
                User.external_id.label("user_external_id"),
            )
            .join(User, Conversation.user_id == User.id)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        if platform:
            stmt = stmt.where(Conversation.platform == platform)
        result = await session.execute(stmt)
        return [
            {
                "id": row.id,
                "platform": row.platform,
                "status": row.status,
                "created_at": row.created_at,
                "user_external_id": row.user_external_id,
            }
            for row in result
        ]

async def list_messages_by_conversation(conversation_id: int, limit: int = 50) -> List[Dict[str, object]]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = (
            select(Message.id, Message.sender, Message.content, Message.created_at)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = list(result)
        rows.reverse()
        return [
            {
                "id": row.id,
                "sender": row.sender,
                "content": row.content,
                "created_at": row.created_at,
            }
            for row in rows
        ]

async def get_recent_messages(conversation_id: int, limit: int = 10) -> List[Dict[str, str]]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = (
            select(Message.sender, Message.content)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = list(result)
        rows.reverse()
        return [{"role": "assistant" if row.sender == "bot" else "user", "content": row.content} for row in rows]

async def create_lead(
    platform: str,
    intent: Optional[str],
    name: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    conversation_id: Optional[int] = None,
) -> Lead:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        lead = Lead(
            platform=platform,
            intent=intent,
            name=name,
            phone=phone,
            email=email,
            conversation_id=conversation_id,
        )
        session.add(lead)
        await session.commit()
        await session.refresh(lead)
        return lead

async def list_leads(limit: int = 50, offset: int = 0) -> List[Lead]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = select(Lead).order_by(Lead.created_at.desc()).limit(limit).offset(offset)
        result = await session.execute(stmt)
        return list(result.scalars().all())

async def get_analytics() -> Dict[str, int | Dict[str, int]]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        total_messages = (await session.execute(select(func.count(Message.id)))).scalar_one()
        total_conversations = (await session.execute(select(func.count(Conversation.id)))).scalar_one()
        total_leads = (await session.execute(select(func.count(Lead.id)))).scalar_one()

        channel_stmt = select(Conversation.platform, func.count(Conversation.id)).group_by(Conversation.platform)
        channel_rows = (await session.execute(channel_stmt)).all()
        channels = {row[0]: row[1] for row in channel_rows}

        user_stmt = select(User.platform, func.count(User.id)).group_by(User.platform)
        user_rows = (await session.execute(user_stmt)).all()
        users_by_platform = {row[0]: row[1] for row in user_rows}

        conv_stmt = select(Conversation.platform, func.count(Conversation.id)).group_by(Conversation.platform)
        conv_rows = (await session.execute(conv_stmt)).all()
        conversations_by_platform = {row[0]: row[1] for row in conv_rows}

        since = datetime.utcnow() - timedelta(hours=24)
        last_stmt = select(func.count(Message.id)).where(Message.created_at >= since)
        last_24h = (await session.execute(last_stmt)).scalar_one()

        return {
            "total_messages": int(total_messages),
            "channels": channels,
            "users_by_platform": users_by_platform,
            "conversations_by_platform": conversations_by_platform,
            "last_24h": int(last_24h),
            "total_conversations": int(total_conversations),
            "total_leads": int(total_leads),
        }
