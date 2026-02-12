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
   - AI_API_KEY=your_openai_key
   - OPENAI_MODEL=gpt-4o-mini
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
1. Start PostgreSQL and create a database named chatbot.
2. Update backend/.env with your DB credentials and API keys.
3. Run alembic upgrade head from backend folder.
4. Start backend: uvicorn app.main:app --host 0.0.0.0 --port 8000
5. Start frontend: npm run dev (from frontend)
6. Expose webhooks with ngrok:
    - ngrok http 8000
    - Use the HTTPS URL for webhook configuration in Meta and Telegram

## Notes
Replace placeholder integrations with real provider SDKs (Twilio, Meta, Telegram). This project is a starter structure.
