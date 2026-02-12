import os

from dotenv import load_dotenv

load_dotenv()

class Settings:
    ai_provider: str = os.getenv("AI_PROVIDER", "openai")
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    ai_base_url: str = os.getenv("AI_BASE_URL", "")
    ai_model: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    verify_token: str = os.getenv("VERIFY_TOKEN", "")
    database_url: str = os.getenv("DATABASE_URL", "")
    meta_api_version: str = os.getenv("META_API_VERSION", "v19.0")
    meta_access_token: str = os.getenv("META_ACCESS_TOKEN", "")
    meta_phone_number_id: str = os.getenv("META_PHONE_NUMBER_ID", "")
    meta_page_access_token: str = os.getenv("META_PAGE_ACCESS_TOKEN", "")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    crm_webhook_url: str = os.getenv("CRM_WEBHOOK_URL", "")
    sheets_webhook_url: str = os.getenv("SHEETS_WEBHOOK_URL", "")

settings = Settings()
