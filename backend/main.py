from fastapi import Depends, FastAPI
import logging
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(debug=settings.DEBUG)