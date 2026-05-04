from __future__ import annotations

from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_ROOT / ".env", override=False)
load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    mysql_host: str = Field(default="localhost", validation_alias="MYSQL_HOST")
    mysql_user: str = Field(default="root", validation_alias="MYSQL_USER")
    mysql_password: str = Field(default="", validation_alias="MYSQL_PASSWORD")
    mysql_database: str = Field(default="railway", validation_alias="MYSQL_DATABASE")
    mysql_port: int = Field(default=3306, validation_alias="MYSQL_PORT")

    frontend_url: str | None = Field(default=None, validation_alias="FRONTEND_URL")

    azure_openai_api_key: str | None = Field(default=None, validation_alias="AZURE_OPENAI_API_KEY")
    azure_openai_endpoint: str | None = Field(default=None, validation_alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_deployment: str | None = Field(default=None, validation_alias="AZURE_OPENAI_DEPLOYMENT")
    azure_openai_api_version: str | None = Field(default=None, validation_alias="AZURE_OPENAI_API_VERSION")

    @property
    def database_url(self) -> str:
        user = quote_plus(self.mysql_user)
        password = quote_plus(self.mysql_password)
        return (
            f"mysql+aiomysql://{user}:{password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
        )


settings = Settings()
