from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .settings import settings

# Database URL - using MySQL for production, SQLite for development
DATABASE_URL = getattr(settings, 'DATABASE_URL', 'sqlite:///./cooking_assistant.db')

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()