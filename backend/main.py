from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging
import sys
from datetime import datetime

# Add parent directory to path for absolute imports when running directly
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Import routers
from routers import quiz, upload

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test S3 connection on startup
try:
    from services.s3_service import S3Service
    s3_service = S3Service()
    logger.info("✅ S3 service initialized successfully")
except Exception as e:
    logger.warning(f"⚠️ S3 service not available: {str(e)}")
    logger.warning("File uploads will still work but files won't be stored in S3")

app = FastAPI(
    title="Remberify API",
    description="AI-powered learning platform with quiz generation and Socratic tutoring",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(quiz.router, prefix="/api", tags=["quiz"])
app.include_router(upload.router, prefix="/api", tags=["upload"])

@app.get("/")
def read_root():
    return {
        "message": "Remberify API is running",
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": [
            "/api/generate_quiz",
            "/api/socratic",
            "/api/summary",
            "/api/upload",
            "/api/upload_image",
            "/api/upload_text",
            "/health"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "replicate": "configured" if os.getenv("REPLICATE_API_TOKEN") else "missing_token",
            "cors": "enabled"
        }
    }

# Error handling middleware
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    """Global error handling middleware"""
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": "An unexpected error occurred. Please try again.",
                "timestamp": datetime.now().isoformat()
            }
        )

# Custom exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper logging"""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "Request failed",
            "message": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={
            "error": "Validation error",
            "message": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

# Main entry point for running directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)