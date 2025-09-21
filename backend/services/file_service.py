"""
File Processing Service
Handles PDF text extraction and image processing
"""

import os
import tempfile
import asyncio
from typing import Optional, Tuple
from PyPDF2 import PdfReader
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class FileProcessingService:
    """Service class for processing different file types"""

    def __init__(self, replicate_service=None):
        """Initialize the file processing service"""
        self.replicate_service = replicate_service

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from a PDF file

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Extracted text content
        """
        try:
            logger.info(f"Extracting text from PDF: {pdf_path}")

            with open(pdf_path, 'rb') as file:
                pdf_reader = PdfReader(file)

                text_content = ""
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text:
                        text_content += f"\n--- Page {page_num + 1} ---\n{text}"

                return text_content.strip()

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    def extract_text_from_image(self, image_source: str) -> str:
        """
        Extract text from an image using GLM-4V-9B OCR

        Args:
            image_source: Either a file path (local) or URL (remote) to the image

        Returns:
            Extracted text content

        Raises:
            ValueError: If OCR fails or replicate service is unavailable
        """
        try:
            logger.info(f"Extracting text from image using GLM-4V-9B: {image_source}")

            # Check if replicate service is available
            if not self.replicate_service:
                raise ValueError("GLM-4V-9B OCR service is not available. Please check your Replicate API configuration.")

            # Handle the async call properly
            try:
                # Get the current event loop
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If there's already a running loop, use run_in_executor
                    # But we need to handle the async call differently since we're in sync context
                    import concurrent.futures
                    import threading

                    # Create a new event loop in a separate thread
                    def run_in_thread():
                        new_loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(new_loop)
                        try:
                            return new_loop.run_until_complete(self.replicate_service.extract_text_from_image(image_source))
                        finally:
                            new_loop.close()

                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(run_in_thread)
                        return future.result()
                else:
                    # If no loop is running, we can run the async method directly
                    return asyncio.run(self.replicate_service.extract_text_from_image(image_source))
            except RuntimeError:
                # No event loop, create a new one
                return asyncio.run(self.replicate_service.extract_text_from_image(image_source))

        except Exception as e:
            logger.error(f"Error extracting text from image with GLM-4V-9B: {str(e)}")
            raise ValueError(f"GLM-4V-9B OCR failed: {str(e)}. Please check your Replicate API token and try again.")



    def process_file(self, file_path: str, file_type: str) -> Tuple[str, str]:
        """
        Process a file and return content and summary

        Args:
            file_path: Path to the file
            file_type: Type of file ("pdf", "image", "text")

        Returns:
            Tuple of (content, file_type_description)
        """
        try:
            if file_type.lower() == "pdf":
                content = self.extract_text_from_pdf(file_path)
                file_type_desc = "PDF document"

            elif file_type.lower() in ["png", "jpg", "jpeg", "image"]:
                content = self.extract_text_from_image(file_path)
                file_type_desc = "Image with text"

            elif file_type.lower() == "text":
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                file_type_desc = "Text file"

            else:
                raise ValueError(f"Unsupported file type: {file_type}")

            # Validate that we got some content
            if not content or len(content.strip()) < 10:
                raise ValueError(f"No readable content found in {file_type} file")

            return content, file_type_desc

        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            raise ValueError(f"Failed to process {file_type} file: {str(e)}")

    def process_file_with_url(self, url: str, file_type: str) -> Tuple[str, str]:
        """
        Process a file using a URL instead of local path

        Args:
            url: URL to the file (S3 URL, etc.)
            file_type: Type of file ("pdf", "image", "text")

        Returns:
            Tuple of (content, file_type_description)
        """
        try:
            if file_type.lower() == "pdf":
                # For PDFs, we might need to download and process locally
                # For now, return a placeholder
                content = f"PDF content from URL: {url}"
                file_type_desc = "PDF document (URL-based)"

            elif file_type.lower() in ["png", "jpg", "jpeg", "image"]:
                # Use the sync method which handles async internally
                logger.info(f"Extracting text from image URL: {url}")
                content = self.extract_text_from_image(url)  # Pass URL directly
                logger.info(f"Extracted content length: {len(content)} characters")
                logger.info(f"Extracted content preview: {content[:100] if content else 'EMPTY'}")
                file_type_desc = "Image with text (URL-based)"

            elif file_type.lower() == "text":
                # For text files, we might need to download and process
                content = f"Text content from URL: {url}"
                file_type_desc = "Text content (URL-based)"

            else:
                content = f"Content from URL: {url}"
                file_type_desc = "Unknown file type (URL-based)"

            return content, file_type_desc

        except Exception as e:
            logger.error(f"Error processing file from URL {url}: {str(e)}")
            raise ValueError(f"Failed to process file from URL: {str(e)}")

    def validate_file(self, file_path: str, allowed_types: list = None) -> dict:
        """
        Validate a file for processing

        Args:
            file_path: Path to the file to validate
            allowed_types: List of allowed file extensions

        Returns:
            Dict with validation results
        """
        if allowed_types is None:
            allowed_types = ["pdf", "png", "jpg", "jpeg", "txt"]

        try:
            # Check if file exists
            if not os.path.exists(file_path):
                return {
                    "valid": False,
                    "error": f"File does not exist: {file_path}"
                }

            # Check if it's actually a file (not a directory)
            if not os.path.isfile(file_path):
                return {
                    "valid": False,
                    "error": f"Path is not a file: {file_path}"
                }

            # Check file size (max 10MB)
            file_size = os.path.getsize(file_path)
            max_size = 10 * 1024 * 1024  # 10MB

            if file_size > max_size:
                return {
                    "valid": False,
                    "error": f"File too large: {file_size / (1024*1024):.2f}MB (max 10MB allowed)"
                }

            # Check if file is empty
            if file_size == 0:
                return {
                    "valid": False,
                    "error": "File is empty"
                }

            # Check file extension
            file_extension = file_path.split('.')[-1].lower()

            if file_extension not in allowed_types:
                return {
                    "valid": False,
                    "error": f"File type not allowed: {file_extension}. Allowed types: {', '.join(allowed_types)}"
                }

            # Check if file is actually readable
            try:
                with open(file_path, 'rb') as f:
                    # Try to read at least 1 byte
                    data = f.read(1)
                    if not data:
                        return {
                            "valid": False,
                            "error": "File appears to be empty or corrupted"
                        }
            except Exception as e:
                return {
                    "valid": False,
                    "error": f"File is not readable or corrupted: {str(e)}"
                }

            return {
                "valid": True,
                "file_size": file_size,
                "file_extension": file_extension,
                "file_type": self._get_file_type_description(file_extension)
            }

        except Exception as e:
            return {
                "valid": False,
                "error": f"Validation error: {str(e)}"
            }

    def _get_file_type_description(self, extension: str) -> str:
        """Get human-readable description of file type"""
        descriptions = {
            "pdf": "PDF document",
            "png": "PNG image",
            "jpg": "JPEG image",
            "jpeg": "JPEG image",
            "txt": "Text file"
        }
        return descriptions.get(extension.lower(), "Unknown file type")

    def save_uploaded_file(self, file_content: bytes, filename: str, upload_dir: str = "uploads") -> str:
        """
        Save an uploaded file to disk

        Args:
            file_content: Binary content of the file
            filename: Original filename
            upload_dir: Directory to save the file

        Returns:
            Path to the saved file
        """
        try:
            # Create upload directory if it doesn't exist
            os.makedirs(upload_dir, exist_ok=True)

            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            name, ext = os.path.splitext(filename)
            unique_filename = f"{name}_{timestamp}{ext}"
            file_path = os.path.join(upload_dir, unique_filename)

            # Save file
            with open(file_path, 'wb') as f:
                f.write(file_content)

            logger.info(f"File saved: {file_path}")
            return file_path

        except Exception as e:
            logger.error(f"Error saving uploaded file: {str(e)}")
            raise ValueError(f"Failed to save uploaded file: {str(e)}")

from datetime import datetime
