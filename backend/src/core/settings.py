from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    # Default to SQLite for development, MySQL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", 
        "sqlite:///./cooking_assistant.db" if os.getenv("ENVIRONMENT", "development") == "development" 
        else "mysql+mysqlconnector://user:password@localhost/cooking_assistant"
    )

    @property
    def isDev(self):
        return self.ENVIRONMENT == "development"

    class Config:
        env_file = f".env.{os.getenv('ENVIRONMENT', 'development')}"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()