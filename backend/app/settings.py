from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# Load local env files (Render uses real env vars).
_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_ROOT / ".env", override=False)
load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    mongodb_uri: str | None = Field(default=None, validation_alias="MONGODB_URI")
    frontend_url: str | None = None


settings = Settings(_env_prefix="")  # reads MONGODB_URI, FRONTEND_URL

