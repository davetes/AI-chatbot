from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.models.db import Base, Message

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

async def save_message(
    channel: str,
    user_message: str,
    bot_message: str,
    user_id: Optional[str] = None,
) -> None:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        session.add(
            Message(
                channel=channel,
                user_message=user_message,
                bot_message=bot_message,
                user_id=user_id,
            )
        )
        await session.commit()

async def list_messages(limit: int = 50, offset: int = 0, channel: Optional[str] = None) -> List[Message]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        stmt = select(Message).order_by(Message.created_at.desc()).limit(limit).offset(offset)
        if channel:
            stmt = stmt.where(Message.channel == channel)
        result = await session.execute(stmt)
        return list(result.scalars().all())

async def get_analytics() -> Dict[str, int | Dict[str, int]]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        total_stmt = select(func.count(Message.id))
        total = (await session.execute(total_stmt)).scalar_one()

        channel_stmt = select(Message.channel, func.count(Message.id)).group_by(Message.channel)
        channel_rows = (await session.execute(channel_stmt)).all()
        channels = {row[0]: row[1] for row in channel_rows}

        since = datetime.utcnow() - timedelta(hours=24)
        last_stmt = select(func.count(Message.id)).where(Message.created_at >= since)
        last_24h = (await session.execute(last_stmt)).scalar_one()

        return {
            "total_messages": int(total),
            "channels": channels,
            "last_24h": int(last_24h),
        }
