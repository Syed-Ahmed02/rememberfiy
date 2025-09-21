"""
File Processing Service
Handles PDF text extraction and image processing
"""

import os
import tempfile
from typing import Optional, Tuple
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
import logging

logger = logging.getLogger(__name__)

class FileProcessingService:
    """Service class for processing different file types"""

    def __init__(self):
        """Initialize the file processing service"""
        pass

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

    def extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text from an image using OCR

        Args:
            image_path: Path to the image file

        Returns:
            Extracted text content
        """
        try:
            logger.info(f"Extracting text from image: {image_path}")

            # Open and preprocess the image
            image = Image.open(image_path)

            # Convert to grayscale for better OCR
            if image.mode != 'L':
                image = image.convert('L')

            # Use pytesseract for OCR
            text = pytesseract.image_to_string(image)

            return text.strip()

        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            raise ValueError(f"Failed to extract text from image: {str(e)}")

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
                    "error": "File does not exist"
                }

            # Check file size (max 10MB)
            file_size = os.path.getsize(file_path)
            max_size = 10 * 1024 * 1024  # 10MB

            if file_size > max_size:
                return {
                    "valid": False,
                    "error": f"File too large: {file_size / (1024*1024):.2f}MB (max 10MB)"
                }

            # Check file extension
            file_extension = file_path.split('.')[-1].lower()

            if file_extension not in allowed_types:
                return {
                    "valid": False,
                    "error": f"File type not allowed: {file_extension}"
                }

            # Check if file is actually readable
            try:
                with open(file_path, 'rb') as f:
                    f.read(1)
            except Exception:
                return {
                    "valid": False,
                    "error": "File is not readable or corrupted"
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
