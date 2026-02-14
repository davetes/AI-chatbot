import asyncio
from time import time

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.routes.web_chat import router as web_chat_router
from app.routes.whatsapp import router as whatsapp_router
from app.routes.messenger import router as messenger_router
from app.routes.telegram import router as telegram_router
from app.routes.instagram import router as instagram_router
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.services.db import get_analytics, init_db

app = FastAPI(title="AI Multi-Channel Chatbot", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_state: dict[str, list[float]] = {}


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    ip = request.client.host if request.client else "anonymous"
    now = time()
    window = 60
    limit = 120
    timestamps = [t for t in _rate_state.get(ip, []) if now - t < window]
    if len(timestamps) >= limit:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
    timestamps.append(now)
    _rate_state[ip] = timestamps
    return await call_next(request)

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

@app.on_event("startup")
async def on_startup() -> None:
    await init_db()

app.include_router(web_chat_router, prefix="/webchat", tags=["webchat"])
app.include_router(whatsapp_router, prefix="/whatsapp", tags=["whatsapp"])
app.include_router(messenger_router, prefix="/messenger", tags=["messenger"])
app.include_router(telegram_router, prefix="/telegram", tags=["telegram"])
app.include_router(instagram_router, prefix="/instagram", tags=["instagram"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])


@app.websocket("/admin/ws/metrics")
async def metrics_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            data = await get_analytics()
            await websocket.send_json(data)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        return
