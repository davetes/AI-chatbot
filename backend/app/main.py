from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.web_chat import router as web_chat_router
from app.routes.whatsapp import router as whatsapp_router
from app.routes.messenger import router as messenger_router
from app.routes.telegram import router as telegram_router
from app.services.db import init_db

app = FastAPI(title="AI Multi-Channel Chatbot", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
