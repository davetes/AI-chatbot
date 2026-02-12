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
- GET /admin/conversations
- GET /admin/leads

## Environment
- backend/.env
   - AI_PROVIDER=openai | groq | openai-compatible
   - AI_API_KEY=your_api_key
   - AI_BASE_URL=https://api.groq.com/openai/v1 (only for Groq or openai-compatible)
   - AI_MODEL=gpt-4o-mini
   - VERIFY_TOKEN=your_webhook_verify_token
   - DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/chatbot
   - META_API_VERSION=v19.0
   - META_ACCESS_TOKEN=your_meta_access_token
   - META_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
   - META_PAGE_ACCESS_TOKEN=your_page_access_token
   - TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   - CRM_WEBHOOK_URL=https://your-crm-webhook
   - SHEETS_WEBHOOK_URL=https://your-sheets-webhook
- frontend/.env.local
   - NEXT_PUBLIC_API_BASE=http://localhost:8000

## Example payloads

### WhatsApp (Meta Cloud API)
{
   "entry": [{
      "changes": [{
         "value": {
            "messages": [{
               "from": "15551234567",
               "text": {"body": "Hi, I want a demo"}
            }]
         }
      }]
   }]
}

### Messenger (Meta Graph API)
{
   "entry": [{
      "messaging": [{
         "sender": {"id": "USER_ID"},
         "message": {"text": "Pricing please"}
      }]
   }]
}

### Web chat
{
   "message": "I need a quote",
   "user_id": "web-user-123"
}

## Step-by-step setup
### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- (Optional) Docker + Docker Compose

### Environment setup
1. Copy/update backend/.env
   - Required: AI_API_KEY, DATABASE_URL
   - Required for Meta webhooks: VERIFY_TOKEN, META_ACCESS_TOKEN, META_PHONE_NUMBER_ID, META_PAGE_ACCESS_TOKEN
   - Required for Telegram: TELEGRAM_BOT_TOKEN
   - Optional: CRM_WEBHOOK_URL, SHEETS_WEBHOOK_URL
2. Update frontend/.env.local
   - NEXT_PUBLIC_API_BASE=http://localhost:8000

### PostgreSQL setup
1. Create a database named chatbot.
2. Ensure DATABASE_URL points to the correct user/password.

### Run locally (recommended)
1. Backend (from backend folder)
   - python -m venv .venv
   - .venv\Scripts\python -m pip install -r requirements.txt
   - .venv\Scripts\python -m alembic upgrade head
   - .venv\Scripts\python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
2. Frontend (from frontend folder)
   - npm install
   - npm run dev

### Run with Docker
1. From docker folder:
   - docker-compose up --build

### Verify
- API health: http://localhost:8000/health
- Web app: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin

Sample requests:
- Web chat:
  - POST http://localhost:8000/webchat/message
  - Body: {"message": "Hello", "user_id": "web-user-123"}
- Admin analytics:
  - GET http://localhost:8000/admin/analytics

### Webhook setup (ngrok)
1. Run: ngrok http 8000
2. Use the HTTPS URL for:
   - WhatsApp: /whatsapp/webhook
   - Messenger: /messenger/webhook
   - Instagram: /instagram/webhook
   - Telegram: /telegram/webhook
3. Set VERIFY_TOKEN in Meta webhook configuration.

### Troubleshooting
- Migration fails: verify DATABASE_URL credentials and database existence.
- Webhooks not responding: check ngrok URL and VERIFY_TOKEN.
- Admin empty: send a message first to create data.

## Notes
This project uses Meta Cloud API and Telegram Bot API for live integrations.
