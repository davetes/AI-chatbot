import os

from dotenv import load_dotenv

load_dotenv()

class Settings:
    api_key: str = os.getenv("AI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    verify_token: str = os.getenv("VERIFY_TOKEN", "")
    database_url: str = os.getenv("DATABASE_URL", "")

settings = Settings()
