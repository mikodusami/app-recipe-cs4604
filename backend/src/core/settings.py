from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "")  # e.g., "mysql" or "mysql:3306"
    DATABASE_USER: str = os.getenv("DATABASE_USER", "root")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "dev")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    API_KEY: str = os.getenv("API_KEY", "dev")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secretkey")

    @property
    def database_url(self):
        if self.ENVIRONMENT == "production" and self.DATABASE_HOST and self.DATABASE_USER and self.DATABASE_PASSWORD and self.DATABASE_NAME:
            # Handle host with or without port
            host_part = self.DATABASE_HOST
            if ":" not in host_part:
                host_part += ":3306"  # Default to 3306 if no port specified
            return f"mysql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{host_part}/{self.DATABASE_NAME}"
        return "sqlite:///./dev.db"  # Default to SQLite for development

    class Config:
        env_file = f".env.{os.getenv('ENVIRONMENT', 'development')}"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()