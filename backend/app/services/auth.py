from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.db import Account
from app.services.db import get_sessionmaker

_security = HTTPBearer(auto_error=False)


def _require_jwt_secret() -> str:
    secret = settings.auth_jwt_secret
    if not secret:
        raise RuntimeError("AUTH_JWT_SECRET is not configured")
    return secret


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("utf-8"))


def _sign(data: bytes, secret: str) -> str:
    sig = hmac.new(secret.encode("utf-8"), data, hashlib.sha256).digest()
    return _b64url_encode(sig)


def create_access_token(subject: str, *, exp_minutes: int) -> str:
    secret = _require_jwt_secret()
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + exp_minutes * 60,
        "iss": "ai-chatbot",
    }

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = _sign(signing_input, secret)
    return f"{header_b64}.{payload_b64}.{signature}"


def decode_access_token(token: str) -> Dict[str, Any]:
    secret = _require_jwt_secret()
    try:
        header_b64, payload_b64, signature = token.split(".")
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected = _sign(signing_input, secret)
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e

    exp = int(payload.get("exp", 0))
    if int(time.time()) >= exp:
        raise HTTPException(status_code=401, detail="Token expired")

    return payload


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
    return f"pbkdf2_sha256$200000${_b64url_encode(salt)}${_b64url_encode(dk)}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters_s, salt_b64, dk_b64 = stored.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        iters = int(iters_s)
        salt = _b64url_decode(salt_b64)
        expected = _b64url_decode(dk_b64)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iters)
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


async def get_account_by_email(email: str, *, session: AsyncSession) -> Optional[Account]:
    stmt = select(Account).where(Account.email == email)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_account_by_id(account_id: int, *, session: AsyncSession) -> Optional[Account]:
    stmt = select(Account).where(Account.id == account_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_current_account(credentials: HTTPAuthorizationCredentials = Depends(_security)) -> Account:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_access_token(credentials.credentials)
    sub = payload.get("sub")
    if not isinstance(sub, str) or not sub.startswith("account:"):
        raise HTTPException(status_code=401, detail="Invalid token subject")

    try:
        account_id = int(sub.split(":", 1)[1])
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid token subject") from e

    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        account = await get_account_by_id(account_id, session=session)
        if not account:
            raise HTTPException(status_code=401, detail="Account not found")
        return account


def profile_from_account(account: Account) -> Dict[str, Any]:
    created_at = account.created_at
    if isinstance(created_at, datetime):
        created = created_at
    else:
        created = datetime.utcnow()
    return {"id": account.id, "email": account.email, "created_at": created}
