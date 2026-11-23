from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "LifeOS API"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./app.db"
    secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24
    upload_dir: str = "uploads"
    max_upload_mb: int = 10
    ai_provider: str = "rules"
    ai_base_url: str = "https://api.openai.com/v1"
    ai_api_key: str = ""
    ai_model: str = "gpt-4o-mini"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    model_config = SettingsConfigDict(env_prefix="LIFEOS_", env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
