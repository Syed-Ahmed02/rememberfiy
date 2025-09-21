"""
File upload and processing API endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from models.quiz import UploadRequest, UploadResponse
from services.replicate_service import ReplicateService
from services.file_service import FileProcessingService
from services.s3_service import S3Service
from datetime import datetime
import tempfile
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
replicate_service = ReplicateService()
file_service = FileProcessingService(replicate_service=replicate_service)

# S3 service initialization with error handling
try:
    s3_service = S3Service()
    s3_available = True
except Exception as e:
    logger.warning(f"S3 service not available: {str(e)}")
    s3_service = None
    s3_available = False

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

            # Read file content first
            file_content = await file.read()

            # Save uploaded file temporarily for processing and validation
            file_extension = file.filename.split('.')[-1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name

            try:
                # Validate file now that we have a real path
                validation = file_service.validate_file(temp_file_path, ["pdf", "png", "jpg", "jpeg", "gif", "webp", "svg"])
                if not validation["valid"]:
                    raise HTTPException(status_code=400, detail=validation["error"])

                # Upload file to S3 if available
                s3_url = None
                if s3_available and s3_service:
                    try:
                        # Check if this is an image file for specialized handling
                        if file_extension in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']:
                            logger.info(f"Uploading image file to S3: {file.filename}")
                            # Use specialized image upload method
                            s3_url = s3_service.upload_image(file_content, file.filename)
                        else:
                            logger.info(f"Uploading file to S3: {file.filename}")
                            # Use general file upload method
                            s3_url = s3_service.upload_file(file_content, file.filename)

                        logger.info(f"File uploaded to S3: {s3_url}")
                    except Exception as e:
                        logger.error(f"S3 upload failed: {str(e)}")
                        s3_url = None
                else:
                    logger.info("S3 not available, skipping S3 upload")

                # Process the file
                if content_type == "image" and s3_available and s3_service and s3_url:
                    # Use URL-based processing for images with S3
                    processed_content, file_type_desc = file_service.process_file_with_url(s3_url, content_type)
                else:
                    # Use local file processing for other cases
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
            file_url=s3_url if 's3_url' in locals() else None,
            processed_at=datetime.now()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")

@router.post("/upload_image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Form(None, description="Optional user ID for organizing files")
):
    """
    Upload and process an image file with S3 storage

    Args:
        file: Image file to upload (PNG, JPG, JPEG, GIF, WebP, SVG)
        user_id: Optional user ID for organizing files

    Returns:
        UploadResponse with processed content, S3 URL, and summary
    """
    try:
        logger.info(f"Processing image upload: {file.filename}")

        # Validate that this is an image file
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']:
            raise HTTPException(status_code=400, detail="File must be an image (PNG, JPG, JPEG, GIF, WebP, SVG)")

        # Read file content
        file_content = await file.read()

        # Save uploaded file temporarily for validation only
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        try:
            # Validate file now that we have a real path
            validation = file_service.validate_file(temp_file_path, ["png", "jpg", "jpeg", "gif", "webp", "svg"])
            if not validation["valid"]:
                raise HTTPException(status_code=400, detail=validation["error"])

        finally:
            # Clean up temp file - we don't need it anymore for validation
            os.unlink(temp_file_path)

        # Upload image to S3 FIRST to get the URL
        s3_url = None
        if s3_available and s3_service:
            try:
                s3_url = s3_service.upload_image(file_content, file.filename, user_id)
                logger.info(f"Image uploaded to S3: {s3_url}")
            except Exception as e:
                logger.error(f"S3 image upload failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to upload image to S3: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail="S3 service is not available. Cannot process images without S3 storage.")

        # Process the image for text extraction using the S3 URL
        logger.info(f"Processing image from S3 URL: {s3_url}")
        processed_content, file_type_desc = file_service.process_file_with_url(s3_url, "image")
        logger.info(f"Processed content length: {len(processed_content)} characters")
        logger.info(f"Processed content preview: {processed_content[:100] if processed_content else 'EMPTY'}")
        file_type = file_type_desc

        # Generate summary using AI
        logger.info(f"Generating summary from content (length: {len(processed_content)})")
        summary = await replicate_service.generate_summary(processed_content)
        logger.info(f"Generated summary: {summary}")

        return UploadResponse(
            content=processed_content,
            summary=summary,
            file_type=file_type,
            file_name=file.filename,
            file_url=s3_url,
            processed_at=datetime.now()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

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
