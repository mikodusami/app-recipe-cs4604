from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from src.core.settings import settings
import logging

logger = logging.getLogger(__name__)

# Create Base class for models
Base = declarative_base()

try:
    engine = create_engine(settings.database_url)
    # Test connection and table existence
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("Database engine and session initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")
    raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

