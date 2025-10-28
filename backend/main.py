from fastapi import Depends, FastAPI
from fastapi.security import APIKeyHeader
from fastapi.openapi.utils import get_openapi
from src.core.settings import settings
from src.core.database import engine, Base
from src.core.dependencies import get_api_key
from src.routers import users

app = FastAPI(
    title="AI Cooking Assistant API", 
    description="""
    AI-powered cooking assistant API.
    
    ## Authentication
    Most endpoints require an API key to be passed in the `X-API-Key` header.
    
    **Development API Key:** `dev`
    
    ## Public Endpoints
    - `/` - Hello World
    - `/health` - Health check
    
    ## Protected Endpoints
    All other endpoints require the API key in the header.
    """,
    openapi_tags=[
        {
            "name": "public",
            "description": "Public endpoints that don't require API key"
        },
        {
            "name": "auth",
            "description": "Authentication test endpoints (requires API key)"
        },
        {
            "name": "users",
            "description": "User management endpoints (requires API key)"
        }
    ]
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key"
        }
    }
    # Apply security to all routes except public ones
    for path, path_item in openapi_schema["paths"].items():
        if not (path == "/" or path == "/health"):
            for method, operation in path_item.items():
                if method.lower() in ["get", "post", "put", "delete", "patch"]:
                    operation["security"] = [{"ApiKeyAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Include routers
app.include_router(users.router)

# Only auto-create tables if using SQLite (so we don't touch your MySQL schema)
@app.on_event("startup")
def create_tables():
    if str(settings.DATABASE_URL).startswith("sqlite"):
        Base.metadata.create_all(bind=engine)

@app.get("/", tags=["public"])
def hello_world():
    return {"Hello": "World"}

@app.get("/health", tags=["public"])
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/protected", tags=["auth"])
async def protected_endpoint(api_key: str = Depends(get_api_key)):
    """Test endpoint to verify API key authentication"""
    return {"message": "Access granted", "api_key_valid": True}