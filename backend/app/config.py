import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "insight_stream")
    COHERE_API_KEY: str = os.getenv("COHERE_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY", "")

    @field_validator("CLERK_SECRET_KEY", mode="before")
    @classmethod
    def normalize_clerk_secret(cls, value):
        if value is None:
            return ""
        value = str(value).strip()
        if value.endswith("..."):
            value = value[:-3]
        return value

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
