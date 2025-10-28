from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text as sql_text

from src.core.settings import settings
from src.core.database import engine, Base
from src.routers import users

app = FastAPI(
    title="AI Cooking Assistant API",
    description="AI-powered cooking assistant",
)

# Allow the React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)

# Only auto-create tables if using SQLite (so we don't touch your MySQL schema)
@app.on_event("startup")
def create_tables():
    if str(settings.DATABASE_URL).startswith("sqlite"):
        Base.metadata.create_all(bind=engine)

@app.get("/")
def hello_world():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    """
    Real DB connectivity check:
      - SELECT VERSION()         -> database server version
      - SELECT DATABASE()        -> current database (schema)
      - SELECT COUNT(*) FROM `Recipe` -> proves we can read your tables
    """
    details = {}
    try:
        with engine.connect() as conn:
            # DB version (works on MySQL/MariaDB; harmless if None elsewhere)
            try:
                details["db_version"] = conn.execute(sql_text("SELECT VERSION()")).scalar()
            except Exception:
                details["db_version"] = None

            # Current database/schema
            try:
                details["current_database"] = conn.execute(sql_text("SELECT DATABASE()")).scalar()
            except Exception:
                details["current_database"] = None

            # Count recipes (uses your exact table/casing)
            try:
                details["recipe_count"] = int(conn.execute(sql_text("SELECT COUNT(*) FROM `Recipe`")).scalar())
            except Exception as e:
                details["recipe_count_error"] = str(e)

        status = "ok"
    except Exception as e:
        status = "error"
        details["error"] = str(e)

    return {"status": status, "details": details}