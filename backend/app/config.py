import os

from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self) -> None:
        self.reload()

    def reload(self) -> None:
        self.ai_provider = os.getenv("AI_PROVIDER", "openai")
        self.ai_api_key = os.getenv("AI_API_KEY", "")
        self.ai_base_url = os.getenv("AI_BASE_URL", "")
        self.ai_model = os.getenv("AI_MODEL", "gpt-4o-mini")
        self.verify_token = os.getenv("VERIFY_TOKEN", "")
        self.database_url = os.getenv("DATABASE_URL", "")
        if self.database_url:
            if self.database_url.startswith("postgres://"):
                self.database_url = self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif self.database_url.startswith("postgresql://") and "+asyncpg" not in self.database_url:
                self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        self.meta_api_version = os.getenv("META_API_VERSION", "v19.0")
        self.meta_access_token = os.getenv("META_ACCESS_TOKEN", "")
        self.meta_phone_number_id = os.getenv("META_PHONE_NUMBER_ID", "")
        self.meta_page_access_token = os.getenv("META_PAGE_ACCESS_TOKEN", "")
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.crm_webhook_url = os.getenv("CRM_WEBHOOK_URL", "")
        self.sheets_webhook_url = os.getenv("SHEETS_WEBHOOK_URL", "")
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.smtp_from = os.getenv("SMTP_FROM", "")
        self.smtp_tls = os.getenv("SMTP_TLS", "true").lower() in {"1", "true", "yes"}

settings = Settings()
