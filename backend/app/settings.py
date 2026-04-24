from pydantic_settings import BaseSettings, SettingsConfigDict
from urllib.parse import quote_plus


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    mysql_host: str
    mysql_user: str
    mysql_password: str
    mysql_database: str = "schooldb"
    mysql_port: int = 3306

    frontend_url: str | None = None

    azure_openai_api_key: str
    azure_openai_endpoint: str
    azure_openai_deployment: str
    azure_openai_api_version: str

    @property
    def sqlalchemy_database_uri(self) -> str:
        # pymysql URL format
        user = quote_plus(self.mysql_user)
        password = quote_plus(self.mysql_password)
        return (
            f"mysql+pymysql://{user}:{password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
        )


settings = Settings()

