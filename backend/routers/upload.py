"""
File upload and processing API endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from models.quiz import UploadRequest, UploadResponse
from services.replicate_service import ReplicateService
from services.file_service import FileProcessingService
from datetime import datetime
import tempfile
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
replicate_service = ReplicateService()
file_service = FileProcessingService()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    content_type: str = Form(..., description="Type of content: 'pdf', 'image', or 'text'")
):
    """
    Upload and process a file or text content

    Args:
        file: Uploaded file (optional if providing text content)
        content_type: Type of content being uploaded

    Returns:
        UploadResponse with processed content and summary
    """
    try:
        logger.info(f"Processing upload: {file.filename}, type: {content_type}")

        if content_type not in ["pdf", "image", "text"]:
            raise HTTPException(status_code=400, detail="Invalid content_type. Must be 'pdf', 'image', or 'text'")

        processed_content = ""
        file_type = content_type

        # Handle different content types
        if content_type == "text":
            # Read text content directly
            processed_content = await file.read()
            processed_content = processed_content.decode('utf-8')

        else:
            # Handle file uploads (PDF or image)
            if not file or file.filename == "":
                raise HTTPException(status_code=400, detail="File is required for PDF and image uploads")

            # Validate file
            validation = file_service.validate_file(file.filename, ["pdf", "png", "jpg", "jpeg"])
            if not validation["valid"]:
                raise HTTPException(status_code=400, detail=validation["error"])

            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_file_path = temp_file.name

            try:
                # Process the file
                processed_content, file_type_desc = file_service.process_file(temp_file_path, content_type)
                file_type = file_type_desc

            finally:
                # Clean up temp file
                os.unlink(temp_file_path)

        # Generate summary using AI
        summary = await replicate_service.generate_summary(processed_content)

        return UploadResponse(
            content=processed_content,
            summary=summary,
            file_type=file_type,
            file_name=file.filename if file and file.filename else None,
            processed_at=datetime.now()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")

@router.post("/upload_text", response_model=UploadResponse)
async def upload_text(request: UploadRequest):
    """
    Upload text content directly (alternative to file upload)

    Args:
        request: UploadRequest with text content

    Returns:
        UploadResponse with processed content and summary
    """
    try:
        logger.info("Processing text upload")

        # Generate summary using AI
        summary = await replicate_service.generate_summary(request.content)

        return UploadResponse(
            content=request.content,
            summary=summary,
            file_type="Text content",
            file_name=request.file_name,
            processed_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Error processing text upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process text: {str(e)}")
