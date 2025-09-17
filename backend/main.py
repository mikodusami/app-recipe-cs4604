from fastapi import Depends, FastAPI
from src.core.settings import settings
from src.core.database import engine, Base
from src.routers import users

app = FastAPI(title="AI Cooking Assistant API", description="AI-powered cooking assistant")

# Include routers
app.include_router(users.router)

# Create database tables on startup
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def hello_world():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}