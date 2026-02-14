from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.models.db import Account
from app.models.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    ProfileResponse,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth import (
    create_access_token,
    get_account_by_email,
    get_current_account,
    hash_password,
    profile_from_account,
    verify_password,
)
from app.services.db import get_sessionmaker

router = APIRouter()


@router.post("/register", response_model=ProfileResponse)
async def register(payload: RegisterRequest) -> Dict[str, Any]:
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        existing = await get_account_by_email(email, session=session)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        account = Account(email=email, password_hash=hash_password(payload.password))
        session.add(account)
        await session.commit()
        await session.refresh(account)
        return profile_from_account(account)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    email = payload.email.strip().lower()
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        account = await get_account_by_email(email, session=session)
        if not account or not verify_password(payload.password, account.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token(subject=f"account:{account.id}", exp_minutes=settings.auth_token_exp_minutes)
        return TokenResponse(access_token=token)


@router.get("/me", response_model=ProfileResponse)
async def me(account: Account = Depends(get_current_account)) -> Dict[str, Any]:
    return profile_from_account(account)


@router.post("/logout")
async def logout() -> Dict[str, str]:
    # JWTs are stateless; logout is handled client-side by deleting the token.
    return {"status": "ok"}


@router.patch("/password")
async def change_password(
    payload: ChangePasswordRequest,
    account: Account = Depends(get_current_account),
) -> Dict[str, str]:
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not verify_password(payload.current_password, account.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        db_account = await session.get(Account, account.id)
        if not db_account:
            raise HTTPException(status_code=404, detail="Account not found")
        db_account.password_hash = hash_password(payload.new_password)
        await session.commit()
        return {"status": "ok"}
