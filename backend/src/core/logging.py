import logging
import logging.handlers
import os
from pathlib import Path
from .settings import settings
from . import strings

# Define the logs directory in the main project directory (backend/logs/)
LOG_DIR = Path(__file__).parents[2] / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Define log file paths
DEBUG_LOG = LOG_DIR / strings.DEBUG_LOG_STR
INFO_LOG = LOG_DIR / strings.INFO_LOG_STR
WARNING_LOG = LOG_DIR / strings.WARNING_LOG_STR
ERROR_LOG = LOG_DIR / strings.ERROR_LOG_STR
CRITICAL_LOG = LOG_DIR / strings.CRITICAL_LOG_STR

# Formatter for log messages
LOG_FORMAT = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

def setup_logger(name, log_file, level):
    """
    Set up a logger with a RotatingFileHandler.
    
    Args:
        name (str): Logger name (usually module name).
        log_file (Path): Path to the log file.
        level (int): Logging level (e.g., logging.DEBUG).
    
    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Create RotatingFileHandler: 1MB per file
    handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=1_000_000,  # 1MB
        backupCount=2
    )
    handler.setFormatter(LOG_FORMAT)
    
    # Clear any existing handlers to avoid duplicates
    logger.handlers = []
    logger.addHandler(handler)
    
    return logger

# Initialize loggers for each level
debug_logger = setup_logger("app.debug", DEBUG_LOG, logging.DEBUG)
info_logger = setup_logger("app.info", INFO_LOG, logging.INFO)
warning_logger = setup_logger("app.warning", WARNING_LOG, logging.WARNING)
error_logger = setup_logger("app.error", ERROR_LOG, logging.ERROR)
critical_logger = setup_logger("app.critical", CRITICAL_LOG, logging.CRITICAL)

# Optional: Add a console handler for debugging in development
if settings.DEBUG:
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(LOG_FORMAT)
    debug_logger.addHandler(console_handler)
    info_logger.addHandler(console_handler)
    warning_logger.addHandler(console_handler)
    error_logger.addHandler(console_handler)
    critical_logger.addHandler(console_handler)