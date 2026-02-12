# Messaging Platform Integrations Guide

This guide explains how to connect your AI chatbot to Telegram, WhatsApp, Facebook Messenger, and Instagram.

## Prerequisites

Before setting up any integration:
1. Your backend server must be running
2. You need a **public HTTPS URL** for webhooks (use ngrok for local development)

### Setting Up ngrok (Required for Local Development)

1. Download ngrok from [ngrok.com](https://ngrok.com/)
2. Sign up for a free account
3. Run ngrok to expose your local server:
   ```bash
   ngrok http 8000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

---

## Integration Architecture

```mermaid
flowchart LR
    subgraph Users
        TU[Telegram User]
        WU[WhatsApp User]
        MU[Messenger User]
        IU[Instagram User]
    end
    
    subgraph Platforms
        TG[Telegram Bot API]
        WA[WhatsApp Cloud API]
        FB[Facebook Graph API]
        IG[Instagram Graph API]
    end
    
    subgraph Your Server
        NG[ngrok HTTPS URL]
        API[FastAPI Backend]
        AI[OpenAI GPT]
    end
    
    TU --> TG
    WU --> WA
    MU --> FB
    IU --> IG
    
    TG -->|POST /telegram/webhook| NG
    WA -->|POST /whatsapp/webhook| NG
    FB -->|POST /messenger/webhook| NG
    IG -->|POST /instagram/webhook| NG
    
    NG --> API
    API --> AI
    AI -->|Response| API
    API -->|Send Reply| Platforms
```

---

## 1. Telegram Bot Setup

Telegram is the **easiest** platform to set up.

### Step 1: Create a Bot with BotFather

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts:
   - Enter a name for your bot (e.g., "My AI Assistant")
   - Enter a username (must end in `bot`, e.g., `myai_assistant_bot`)
4. BotFather will give you a **Bot Token** like:
   ```
   7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
   ```

### Step 2: Configure Environment

Add the token to [`backend/.env`](backend/.env):
```env
TELEGRAM_BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

### Step 3: Set Up Webhook

With your server running and ngrok active, set the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_NGROK_URL>/telegram/webhook"
```

Example:
```bash
curl -X POST "https://api.telegram.org/bot7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw/setWebhook?url=https://abc123.ngrok.io/telegram/webhook"
```

### Step 4: Test

1. Open Telegram
2. Search for your bot by username
3. Send a message
4. The bot should respond with AI-generated text

### Verify Webhook Status

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

---

## 2. WhatsApp Business Setup

WhatsApp requires a **Meta Business Account** and is more complex.

### Step 1: Create Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create an account or log in
3. Create a new App:
   - Select "Business" type
   - Enter app name
   - Select your business account

### Step 2: Set Up WhatsApp Business

1. In your app dashboard, add "WhatsApp" product
2. Go to WhatsApp > Getting Started
3. Note down:
   - **Phone Number ID** (e.g., `123456789012345`)
   - **WhatsApp Business Account ID**
4. Generate a **Permanent Access Token**:
   - Go to Business Settings > System Users
   - Create a system user with admin access
   - Generate a token with `whatsapp_business_messaging` permission

### Step 3: Configure Environment

Add to [`backend/.env`](backend/.env):
```env
META_API_VERSION=v19.0
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789012345
VERIFY_TOKEN=my-secret-verify-token-123
```

### Step 4: Configure Webhook

1. In Meta Developer Console, go to WhatsApp > Configuration
2. Click "Edit" on Webhook
3. Enter:
   - **Callback URL**: `https://<YOUR_NGROK_URL>/whatsapp/webhook`
   - **Verify Token**: Same as `VERIFY_TOKEN` in your `.env`
4. Subscribe to `messages` field

### Step 5: Test

1. Add a test phone number in WhatsApp > Getting Started
2. Send a message from that phone to your WhatsApp Business number
3. The bot should respond

### Important Notes

- WhatsApp has a **24-hour messaging window** - you can only reply within 24 hours of receiving a message
- For production, you need to verify your business and get approved
- Test numbers are limited to 5 in development mode

---

## 3. Facebook Messenger Setup

### Step 1: Create a Facebook Page

1. Go to [Facebook](https://www.facebook.com/)
2. Create a new Page for your business/bot

### Step 2: Set Up Meta App

1. In [Meta for Developers](https://developers.facebook.com/), use the same app or create a new one
2. Add "Messenger" product
3. Go to Messenger > Settings

### Step 3: Generate Page Access Token

1. In Messenger Settings, find "Access Tokens"
2. Click "Add or Remove Pages"
3. Select your Facebook Page
4. Generate a Page Access Token

### Step 4: Configure Environment

Add to [`backend/.env`](backend/.env):
```env
META_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VERIFY_TOKEN=my-secret-verify-token-123
```

### Step 5: Configure Webhook

1. In Messenger > Settings > Webhooks
2. Click "Add Callback URL"
3. Enter:
   - **Callback URL**: `https://<YOUR_NGROK_URL>/messenger/webhook`
   - **Verify Token**: Same as `VERIFY_TOKEN` in your `.env`
4. Subscribe to `messages` field

### Step 6: Test

1. Go to your Facebook Page
2. Click "Send Message"
3. Send a message to your page
4. The bot should respond

---

## 4. Instagram Setup

Instagram messaging uses the same Meta infrastructure as Messenger.

### Step 1: Connect Instagram to Facebook Page

1. You need an **Instagram Professional Account** (Business or Creator)
2. Connect it to your Facebook Page in Instagram Settings

### Step 2: Enable Instagram Messaging

1. In Meta Developer Console, go to your app
2. Add "Instagram" product if not already added
3. Go to Instagram > Settings

### Step 3: Configure Webhook

1. In Instagram > Webhooks
2. Add callback URL: `https://<YOUR_NGROK_URL>/instagram/webhook`
3. Use the same `VERIFY_TOKEN`
4. Subscribe to `messages` field

### Step 4: Use Same Access Token

Instagram uses the same `META_PAGE_ACCESS_TOKEN` as Messenger.

### Step 5: Test

1. Send a DM to your Instagram account
2. The bot should respond

---

## Environment Variables Summary

Here is a complete [`backend/.env`](backend/.env) with all integrations:

```env
# AI Configuration
AI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Database
DATABASE_URL=postgresql+asyncpg://postgres:2324@localhost:5432/chatbot

# Webhook Verification (used by Meta platforms)
VERIFY_TOKEN=my-secret-verify-token-123

# Meta/WhatsApp Configuration
META_API_VERSION=v19.0
META_ACCESS_TOKEN=EAAxxxxxxxx_whatsapp_token
META_PHONE_NUMBER_ID=123456789012345

# Facebook Messenger & Instagram
META_PAGE_ACCESS_TOKEN=EAAxxxxxxxx_page_token

# Telegram
TELEGRAM_BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw

# Optional: CRM/Sheets Integration
CRM_WEBHOOK_URL=
SHEETS_WEBHOOK_URL=
```

---

## Webhook Endpoints Reference

| Platform | Webhook URL | Method |
|----------|-------------|--------|
| Telegram | `/telegram/webhook` | POST |
| WhatsApp | `/whatsapp/webhook` | GET (verify) + POST (messages) |
| Messenger | `/messenger/webhook` | GET (verify) + POST (messages) |
| Instagram | `/instagram/webhook` | GET (verify) + POST (messages) |

---

## Testing Checklist

- [ ] Backend server is running on port 8000
- [ ] ngrok is running and forwarding to port 8000
- [ ] Environment variables are configured
- [ ] Webhook is registered with the platform
- [ ] Test message sent and response received

---

## Troubleshooting

### Telegram

| Issue | Solution |
|-------|----------|
| Bot not responding | Check `TELEGRAM_BOT_TOKEN` is correct |
| Webhook not set | Run the setWebhook curl command again |
| Error 401 | Token is invalid or expired |

### WhatsApp/Messenger/Instagram

| Issue | Solution |
|-------|----------|
| Webhook verification fails | Check `VERIFY_TOKEN` matches in both places |
| Messages not received | Ensure you subscribed to `messages` field |
| Cannot send replies | Check access token has correct permissions |
| 24-hour window expired | User must message first to reopen window |

### General

| Issue | Solution |
|-------|----------|
| ngrok URL changed | Update webhook URL in platform settings |
| SSL error | Make sure you are using HTTPS ngrok URL |
| Server error 500 | Check backend logs for detailed error |

---

## Production Deployment

For production, instead of ngrok:

1. Deploy your backend to a cloud provider (AWS, GCP, Azure, Railway, Render)
2. Set up a domain with SSL certificate
3. Update webhook URLs to your production domain
4. For Meta platforms, complete business verification
