# AI Multi-Channel Chatbot

Multi-channel AI chatbot with a FastAPI backend and Next.js web app.

## What is included
- FastAPI backend with webhook routes for WhatsApp, Messenger, Telegram, and Web Chat.
- Next.js web UI for chat and admin dashboard.
- Docker setup for local orchestration.

## Quick start

### Backend
1. Create a virtual environment and install dependencies from backend/requirements.txt
2. Configure backend/.env with OpenAI and Postgres settings
3. Run migrations (optional if you rely on auto-create on startup):
   - alembic upgrade head
4. Start the server with uvicorn:
   - Module: app.main:app
   - Port: 8000

### Frontend
1. Install dependencies in frontend
2. Run the dev server

### Web chat API
- POST /webchat/message with JSON: {"message": "Hello"}

### Admin APIs
- GET /admin/messages
- GET /admin/analytics

## Environment
- backend/.env
   - AI_API_KEY=your_openai_key
   - OPENAI_MODEL=gpt-4o-mini
   - VERIFY_TOKEN=your_webhook_verify_token
   - DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/chatbot
   - META_API_VERSION=v19.0
   - META_ACCESS_TOKEN=your_meta_access_token
   - META_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
   - META_PAGE_ACCESS_TOKEN=your_page_access_token
   - TELEGRAM_BOT_TOKEN=your_telegram_bot_token
- frontend/.env.local
   - NEXT_PUBLIC_API_BASE=http://localhost:8000

## Notes
Replace placeholder integrations with real provider SDKs (Twilio, Meta, Telegram). This project is a starter structure.
