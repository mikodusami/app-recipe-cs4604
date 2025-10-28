from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from src.core.settings import settings

api_key_header = APIKeyHeader(
    name="X-API-Key", 
    auto_error=False,
    description="API Key required for accessing protected endpoints"
)

async def get_api_key(api_key: str = Depends(api_key_header)):
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key. Please provide X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    if api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key. Please check your X-API-Key header value.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    return api_key