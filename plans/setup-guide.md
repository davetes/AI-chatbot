# AI Chatbot Setup Guide - Step by Step

## Project Overview

Your AI Multi-Channel Chatbot is a full-stack application with:
- **Backend**: FastAPI (Python) with OpenAI integration for AI responses
- **Frontend**: Next.js (React/TypeScript) web interface
- **Database**: PostgreSQL for storing conversations, messages, and leads
- **Integrations**: WhatsApp, Messenger, Telegram, Instagram webhooks

## Current Status

Based on my analysis:
- ✅ Project structure is complete
- ✅ Database URL is configured: `postgresql+asyncpg://postgres:2324@localhost:5432/chatbot`
- ⚠️ **AI_API_KEY is missing** - Required for AI responses
- ⚠️ PostgreSQL database needs to be created
- ⚠️ Dependencies need to be installed

---

## Step-by-Step Setup

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key - you will need it in Step 2

### Step 2: Configure Environment Variables

Edit the file [`backend/.env`](backend/.env) and add your OpenAI API key:

```env
AI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
VERIFY_TOKEN=your-webhook-verify-token
DATABASE_URL=postgresql+asyncpg://postgres:2324@localhost:5432/chatbot
```

**Note**: The `AI_API_KEY` is required for the chatbot to generate AI responses. Without it, the bot will only echo messages back.

### Step 3: Set Up PostgreSQL Database

#### Option A: Using PostgreSQL directly

1. Open PostgreSQL command line or pgAdmin
2. Create the database:
   ```sql
   CREATE DATABASE chatbot;
   ```
3. Verify your connection settings match the DATABASE_URL in `.env`

#### Option B: Using Docker

```bash
docker run --name chatbot-postgres -e POSTGRES_PASSWORD=2324 -e POSTGRES_DB=chatbot -p 5432:5432 -d postgres:14
```

### Step 4: Install Backend Dependencies

Open a terminal in the project root and run:

```bash
cd backend
python -m venv .venv
```

Then activate the virtual environment:
- **Windows CMD**: `.venv\Scripts\activate`
- **Windows PowerShell**: `.venv\Scripts\Activate.ps1`
- **Linux/Mac**: `source .venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

### Step 5: Run Database Migrations

With the virtual environment activated:

```bash
cd backend
alembic upgrade head
```

This creates the necessary database tables:
- `users` - Stores user information
- `conversations` - Tracks chat sessions
- `messages` - Stores all messages
- `leads` - Stores collected lead information

### Step 6: Start the Backend Server

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify it is running by visiting: http://localhost:8000/health

You should see: `{"status": "ok"}`

### Step 7: Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Step 8: Configure Frontend Environment

Create [`frontend/.env.local`](frontend/.env.local) if it does not exist:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### Step 9: Start the Frontend Server

```bash
cd frontend
npm run dev
```

The web app will be available at: http://localhost:3000

### Step 10: Test the Chatbot

1. Open http://localhost:3000 in your browser
2. You should see the chat interface
3. Type a message and send it
4. The AI should respond with a lead-collection focused reply

---

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend
        UI[Next.js Web App<br/>localhost:3000]
    end
    
    subgraph Backend
        API[FastAPI Server<br/>localhost:8000]
        AI[OpenAI Integration]
        DB[(PostgreSQL<br/>chatbot database)]
    end
    
    subgraph External Channels
        WA[WhatsApp]
        MSG[Messenger]
        TG[Telegram]
        IG[Instagram]
    end
    
    UI -->|POST /webchat/message| API
    API --> AI
    AI -->|GPT-4o-mini| OpenAI[OpenAI API]
    API --> DB
    
    WA -->|Webhook| API
    MSG -->|Webhook| API
    TG -->|Webhook| API
    IG -->|Webhook| API
```

---

## Quick Commands Summary

| Action | Command |
|--------|---------|
| Start Backend | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` |
| Start Frontend | `cd frontend && npm run dev` |
| Run Migrations | `cd backend && alembic upgrade head` |
| Test API | `curl http://localhost:8000/health` |

---

## What the Chatbot Does

The AI chatbot is designed for **lead collection**. It will:

1. **Greet users** and engage in conversation
2. **Collect lead information**: name, phone, email, company, intent
3. **Ask follow-up questions** if information is missing
4. **Store conversations** in the database
5. **Extract lead data** automatically from messages

---

## Next Steps After Setup

Once the basic setup is working, you can:

1. **Customize the AI prompt** - Edit [`backend/app/ai/chatbot.py`](backend/app/ai/chatbot.py:10) to change the bot personality
2. **Add RAG context** - Implement [`backend/app/ai/rag.py`](backend/app/ai/rag.py) for knowledge base retrieval
3. **Connect messaging platforms** - Set up webhooks for WhatsApp, Telegram, etc.
4. **View admin dashboard** - Visit http://localhost:3000/admin to see analytics

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Verify PostgreSQL is running and DATABASE_URL is correct |
| AI not responding | Check AI_API_KEY is set correctly in backend/.env |
| Frontend cannot connect | Ensure backend is running on port 8000 |
| Migration fails | Create the database first, then run migrations |
