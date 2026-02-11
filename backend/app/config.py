import os

from dotenv import load_dotenv

load_dotenv()

class Settings:
    api_key: str = os.getenv("AI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    verify_token: str = os.getenv("VERIFY_TOKEN", "")
    database_url: str = os.getenv("DATABASE_URL", "")
    meta_api_version: str = os.getenv("META_API_VERSION", "v19.0")
    meta_access_token: str = os.getenv("META_ACCESS_TOKEN", "")
    meta_phone_number_id: str = os.getenv("META_PHONE_NUMBER_ID", "")
    meta_page_access_token: str = os.getenv("META_PAGE_ACCESS_TOKEN", "")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

settings = Settings()
