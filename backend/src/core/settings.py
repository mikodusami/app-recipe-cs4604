from pydantic_settings import BaseSettings
import os
import logging

logger = logging.getLogger(__name__)

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
        # Debug logging to see what's happening
        logger.info(f"ENVIRONMENT: '{self.ENVIRONMENT}'")
        logger.info(f"DATABASE_HOST: '{self.DATABASE_HOST}'")
        logger.info(f"DATABASE_USER: '{self.DATABASE_USER}'")
        logger.info(f"DATABASE_NAME: '{self.DATABASE_NAME}'")
        logger.info(f"DATABASE_PASSWORD set: {bool(self.DATABASE_PASSWORD)}")
        
        if self.ENVIRONMENT == "production" and self.DATABASE_HOST and self.DATABASE_USER and self.DATABASE_PASSWORD and self.DATABASE_NAME:
            # Handle host with or without port
            host_part = self.DATABASE_HOST
            if ":" not in host_part:
                host_part += ":3306"  # Default to 3306 if no port specified
            logger.info(f"Using MySQL connection: mysql+mysqlconnector://{self.DATABASE_USER}:***@{host_part}/{self.DATABASE_NAME}")
            return f"mysql+mysqlconnector://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{host_part}/{self.DATABASE_NAME}"
        
        logger.info("Using SQLite connection: sqlite:///./dev.db")
        return "sqlite:///./dev.db"  # Default to SQLite for development

    class Config:
        env_file = f".env.{os.getenv('ENVIRONMENT', 'development')}"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()