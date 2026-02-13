# Meta Platforms Setup Guide (WhatsApp, Messenger, Instagram)

This guide provides detailed step-by-step instructions for integrating your chatbot with WhatsApp, Facebook Messenger, and Instagram.

---

## Prerequisites

Before starting:
1. Your backend server must be running (`python -m uvicorn app.main:app --reload`)
2. You need ngrok for local development (or a public HTTPS URL for production)

### Start ngrok First

```bash
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) - you'll need this for webhooks.

---

## Part 1: WhatsApp Business Setup

### Step 1: Create Meta Developer Account

1. Go to **[developers.facebook.com](https://developers.facebook.com/)**
2. Click **"Get Started"** or **"Log In"**
3. Log in with your Facebook account
4. Accept the developer terms

### Step 2: Create a Meta App

1. Click **"My Apps"** in the top right
2. Click **"Create App"**
3. Select **"Other"** for use case, then click **Next**
4. Select **"Business"** as app type, click **Next**
5. Fill in:
   - **App Name**: e.g., "My AI Chatbot"
   - **App Contact Email**: your email
   - **Business Account**: Select existing or create new
6. Click **"Create App"**

### Step 3: Add WhatsApp Product

1. In your app dashboard, scroll down to **"Add products to your app"**
2. Find **"WhatsApp"** and click **"Set up"**
3. You'll be taken to WhatsApp Getting Started page

### Step 4: Get Your Credentials

On the WhatsApp > Getting Started page:

1. **Phone Number ID**: 
   - Look for "From" section
   - You'll see a test phone number with an ID like `123456789012345`
   - Copy this number

2. **Temporary Access Token**:
   - Click **"Generate"** under "Temporary access token"
   - Copy the token (starts with `EAA...`)
   - ⚠️ This token expires in 24 hours!

### Step 5: Create Permanent Access Token (Recommended)

For a token that doesn't expire:

1. Go to **Business Settings** > **System Users**
   - URL: `https://business.facebook.com/settings/system-users`
2. Click **"Add"** to create a new system user
3. Name it (e.g., "Chatbot API User")
4. Set role to **Admin**
5. Click **"Create System User"**
6. Click on the user, then **"Add Assets"**
7. Select **Apps** > Your app > Enable **Full Control**
8. Click **"Generate New Token"**
9. Select your app
10. Check these permissions:
    - `whatsapp_business_messaging`
    - `whatsapp_business_management`
11. Click **"Generate Token"**
12. **Copy and save this token securely!**

### Step 6: Configure Your .env File

Add these to `backend/.env`:

```env
# WhatsApp Configuration
META_API_VERSION=v19.0
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789012345
VERIFY_TOKEN=my-secret-verify-token-123
```

**Note**: `VERIFY_TOKEN` can be any string you choose - you'll use the same string when setting up the webhook.

### Step 7: Set Up Webhook

1. In Meta Developer Console, go to **WhatsApp** > **Configuration**
2. Under **Webhook**, click **"Edit"**
3. Enter:
   - **Callback URL**: `https://your-ngrok-url.ngrok-free.app/whatsapp/webhook`
   - **Verify Token**: `my-secret-verify-token-123` (same as in .env)
4. Click **"Verify and Save"**
5. Under **Webhook Fields**, click **"Manage"**
6. Subscribe to **"messages"** field

### Step 8: Add Test Phone Number

1. Go to **WhatsApp** > **Getting Started**
2. Under **"To"** section, click **"Add phone number"**
3. Enter your personal phone number
4. You'll receive a verification code via WhatsApp
5. Enter the code to verify

### Step 9: Test WhatsApp Integration

1. Make sure your backend is running
2. Make sure ngrok is running
3. Send a WhatsApp message from your verified phone to the test number
4. You should receive an AI-generated response!

---

## Part 2: Facebook Messenger Setup

### Step 1: Create a Facebook Page

1. Go to **[facebook.com/pages/create](https://www.facebook.com/pages/create)**
2. Choose a category (e.g., "Brand or Product")
3. Enter a page name (e.g., "My AI Assistant")
4. Click **"Create Page"**

### Step 2: Add Messenger Product to Your App

1. Go back to **[developers.facebook.com](https://developers.facebook.com/)**
2. Open your app (created earlier for WhatsApp)
3. In the left sidebar, click **"Add Product"**
4. Find **"Messenger"** and click **"Set up"**

### Step 3: Generate Page Access Token

1. Go to **Messenger** > **Settings**
2. Under **"Access Tokens"**, click **"Add or Remove Pages"**
3. Select your Facebook Page
4. Grant all requested permissions
5. Click **"Generate Token"** next to your page
6. Copy the token

### Step 4: Update Your .env File

Add to `backend/.env`:

```env
# Facebook Messenger Configuration
META_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Set Up Messenger Webhook

1. In **Messenger** > **Settings** > **Webhooks**
2. Click **"Add Callback URL"**
3. Enter:
   - **Callback URL**: `https://your-ngrok-url.ngrok-free.app/messenger/webhook`
   - **Verify Token**: `my-secret-verify-token-123` (same as before)
4. Click **"Verify and Save"**
5. Under **Webhook Fields**, subscribe to:
   - `messages`
   - `messaging_postbacks` (optional)

### Step 6: Test Messenger Integration

1. Go to your Facebook Page
2. Click **"Send Message"** button
3. Send a message
4. You should receive an AI-generated response!

---

## Part 3: Instagram Setup

### Step 1: Convert to Professional Account

1. Open Instagram app
2. Go to **Settings** > **Account**
3. Tap **"Switch to Professional Account"**
4. Choose **"Business"** or **"Creator"**
5. Complete the setup

### Step 2: Connect Instagram to Facebook Page

1. In Instagram app, go to **Settings** > **Account** > **Linked Accounts**
2. Tap **"Facebook"**
3. Log in and select your Facebook Page
4. Grant permissions

### Step 3: Enable Instagram Messaging in Meta App

1. Go to **[developers.facebook.com](https://developers.facebook.com/)**
2. Open your app
3. Go to **Messenger** > **Settings**
4. Under **"Access Tokens"**, your Instagram account should appear
5. If not, click **"Add or Remove Pages"** and connect Instagram

### Step 4: Set Up Instagram Webhook

1. In your app, go to **Messenger** > **Settings** > **Webhooks**
2. You may need to add a separate webhook for Instagram, or it may use the same one
3. If separate, add:
   - **Callback URL**: `https://your-ngrok-url.ngrok-free.app/instagram/webhook`
   - **Verify Token**: `my-secret-verify-token-123`
4. Subscribe to **"messages"** field

### Step 5: Test Instagram Integration

1. Have someone send a DM to your Instagram account
2. You should receive an AI-generated response!

---

## Complete .env Configuration

Here's your complete `backend/.env` file with all integrations:

```env
# ===================
# AI Configuration
# ===================
AI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# ===================
# Database
# ===================
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/chatbot

# ===================
# Webhook Verification
# ===================
# Used by all Meta platforms (WhatsApp, Messenger, Instagram)
VERIFY_TOKEN=my-secret-verify-token-123

# ===================
# Telegram
# ===================
TELEGRAM_BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw

# ===================
# WhatsApp Business
# ===================
META_API_VERSION=v19.0
META_ACCESS_TOKEN=EAAxxxxxxxx_your_whatsapp_system_user_token
META_PHONE_NUMBER_ID=123456789012345

# ===================
# Facebook Messenger & Instagram
# ===================
META_PAGE_ACCESS_TOKEN=EAAxxxxxxxx_your_page_access_token
```

---

## Webhook URLs Summary

| Platform | Webhook URL |
|----------|-------------|
| Telegram | `https://your-url/telegram/webhook` |
| WhatsApp | `https://your-url/whatsapp/webhook` |
| Messenger | `https://your-url/messenger/webhook` |
| Instagram | `https://your-url/instagram/webhook` |

---

## Troubleshooting

### Webhook Verification Fails

**Problem**: Meta says "Callback URL couldn't be verified"

**Solutions**:
1. Make sure your backend is running
2. Make sure ngrok is running and the URL is correct
3. Check that `VERIFY_TOKEN` in `.env` matches what you entered in Meta
4. Check backend logs for errors

### Messages Not Being Received

**Problem**: You send a message but nothing happens

**Solutions**:
1. Check that you subscribed to the `messages` webhook field
2. Check backend logs for incoming requests
3. For WhatsApp, make sure you're using a verified test number

### Replies Not Being Sent

**Problem**: Messages are received but no reply is sent

**Solutions**:
1. Check that access tokens are correct and not expired
2. Check backend logs for API errors
3. For WhatsApp, check the 24-hour messaging window

### Token Expired

**Problem**: Getting 401 or "Invalid OAuth access token" errors

**Solutions**:
1. Generate a new token
2. For permanent tokens, use System User tokens (see Step 5 in WhatsApp setup)

---

## Going to Production

When you're ready for production:

1. **Deploy your backend** to a cloud provider (Railway, Render, AWS, etc.)
2. **Get a domain** with SSL certificate
3. **Update webhook URLs** in Meta Developer Console to your production domain
4. **Complete Business Verification** in Meta Business Suite
5. **Request permissions** for production access (especially for WhatsApp)

### Production Checklist

- [ ] Backend deployed with HTTPS
- [ ] Environment variables configured on server
- [ ] Webhook URLs updated to production domain
- [ ] Business verification completed
- [ ] App reviewed and approved (if required)
- [ ] Production access granted for WhatsApp
