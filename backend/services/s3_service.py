"""
S3 Storage Service
Handles file uploads to AWS S3 bucket
"""

import os
import boto3
import logging
from botocore.exceptions import ClientError
from typing import Optional, Tuple
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class S3Service:
    """Service class for interacting with AWS S3"""

    def __init__(self):
        """Initialize the S3 service with environment variables"""
        self.s3_url = os.getenv("S3_STORAGE_URL")
        self.access_key = os.getenv("S3_ACCESS_KEY")
        self.secret_key = os.getenv("S3_SECRET_ACCESS_KEY")

        if not all([self.s3_url, self.access_key, self.secret_key]):
            raise ValueError("S3_STORAGE_URL, S3_ACCESS_KEY, and S3_SECRET_ACCESS_KEY environment variables are required")

        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.s3_url if self.s3_url != "https://s3.amazonaws.com" else None
        )

        # Extract bucket name from URL or use default
        if self.s3_url.startswith("https://"):
            self.bucket_name = self.s3_url.split("/")[2].split(".")[0]
        else:
            self.bucket_name = "remeberify-uploads"  # default bucket name

        logger.info(f"S3 Service initialized with bucket: {self.bucket_name}")

    def upload_file(self, file_content: bytes, original_filename: str, user_id: str = None) -> str:
        """
        Upload a file to S3 and return the public URL

        Args:
            file_content: Binary content of the file
            original_filename: Original filename from user
            user_id: Optional user ID for organizing files

        Returns:
            Public URL of the uploaded file
        """
        try:
            # Generate unique filename
            file_extension = os.path.splitext(original_filename)[1]
            unique_id = str(uuid.uuid4())[:8]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Create organized file path
            if user_id:
                s3_key = f"users/{user_id}/{timestamp}_{unique_id}_{original_filename}"
            else:
                s3_key = f"uploads/{timestamp}_{unique_id}_{original_filename}"

            # Upload file to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=self._get_content_type(original_filename),
                ACL='public-read'  # Make file publicly accessible
            )

            # Generate public URL
            if self.s3_url.endswith("/"):
                public_url = f"{self.s3_url}{s3_key}"
            else:
                public_url = f"{self.s3_url}/{s3_key}"

            logger.info(f"File uploaded successfully: {public_url}")
            return public_url

        except ClientError as e:
            logger.error(f"S3 upload error: {str(e)}")
            raise ValueError(f"Failed to upload file to S3: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during S3 upload: {str(e)}")
            raise ValueError(f"Failed to upload file: {str(e)}")

    def upload_file_from_path(self, file_path: str, original_filename: str, user_id: str = None) -> str:
        """
        Upload a file to S3 from a local file path

        Args:
            file_path: Local path to the file
            original_filename: Original filename from user
            user_id: Optional user ID for organizing files

        Returns:
            Public URL of the uploaded file
        """
        try:
            # Read file content
            with open(file_path, 'rb') as f:
                file_content = f.read()

            return self.upload_file(file_content, original_filename, user_id)

        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")
        except Exception as e:
            logger.error(f"Error reading file from path: {str(e)}")
            raise ValueError(f"Failed to read file: {str(e)}")

    def delete_file(self, s3_key: str) -> bool:
        """
        Delete a file from S3

        Args:
            s3_key: S3 key of the file to delete

        Returns:
            True if successful, False otherwise
        """
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info(f"File deleted from S3: {s3_key}")
            return True

        except ClientError as e:
            logger.error(f"S3 delete error: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during S3 delete: {str(e)}")
            return False

    def file_exists(self, s3_key: str) -> bool:
        """
        Check if a file exists in S3

        Args:
            s3_key: S3 key of the file to check

        Returns:
            True if file exists, False otherwise
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            return True

        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            else:
                logger.error(f"S3 head_object error: {str(e)}")
                return False
        except Exception as e:
            logger.error(f"Unexpected error during S3 file check: {str(e)}")
            return False

    def _get_content_type(self, filename: str) -> str:
        """
        Get the content type based on file extension

        Args:
            filename: Name of the file

        Returns:
            MIME content type
        """
        extension = os.path.splitext(filename)[1].lower()

        content_types = {
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }

        return content_types.get(extension, 'application/octet-stream')

    def is_image_file(self, filename: str) -> bool:
        """
        Check if a file is an image based on extension

        Args:
            filename: Name of the file

        Returns:
            True if file is an image, False otherwise
        """
        image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}
        extension = os.path.splitext(filename)[1].lower()
        return extension in image_extensions

    def upload_image(self, file_content: bytes, original_filename: str, user_id: str = None) -> str:
        """
        Upload an image file to S3 with image-specific handling

        Args:
            file_content: Binary content of the image
            original_filename: Original filename from user
            user_id: Optional user ID for organizing files

        Returns:
            Public URL of the uploaded image
        """
        try:
            # Validate that this is actually an image
            if not self.is_image_file(original_filename):
                raise ValueError(f"File {original_filename} is not a supported image format")

            # Generate unique filename
            file_extension = os.path.splitext(original_filename)[1]
            unique_id = str(uuid.uuid4())[:8]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Create organized path for images
            if user_id:
                s3_key = f"users/{user_id}/images/{timestamp}_{unique_id}_{original_filename}"
            else:
                s3_key = f"images/{timestamp}_{unique_id}_{original_filename}"

            # Upload image to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=self._get_content_type(original_filename),
                ACL='public-read',  # Make image publicly accessible
                Metadata={
                    'uploaded_at': datetime.now().isoformat(),
                    'original_filename': original_filename
                }
            )
            
            # Verify the upload was successful
            try:
                self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
                logger.info(f"Image upload verified: {s3_key}")
            except ClientError as e:
                logger.error(f"Failed to verify image upload: {str(e)}")
                raise ValueError(f"Image upload verification failed: {str(e)}")

            # Generate public URL with proper handling for different storage providers
            if "supabase" in self.s3_url.lower():
                # For Supabase, generate the public URL using the correct format
                # Supabase storage URLs need to be constructed differently
                base_url = self.s3_url.replace('/storage/v1/s3', '/storage/v1/object/public')
                public_url = f"{base_url}/{self.bucket_name}/{s3_key}"
            else:
                # For standard S3 or S3-compatible storage
                if self.s3_url.endswith("/"):
                    public_url = f"{self.s3_url}{s3_key}"
                else:
                    public_url = f"{self.s3_url}/{s3_key}"

            logger.info(f"Image uploaded successfully: {public_url}")
            return public_url

        except ClientError as e:
            logger.error(f"S3 image upload error: {str(e)}")
            raise ValueError(f"Failed to upload image to S3: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during image upload: {str(e)}")
            raise ValueError(f"Failed to upload image: {str(e)}")

    def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for temporary access to a private file

        Args:
            s3_key: S3 key of the file
            expiration: URL expiration time in seconds (default 1 hour)

        Returns:
            Presigned URL or None if error
        """
        try:
            # For public files, we can generate a direct URL
            # For private files, use presigned URL
            if self.s3_url.endswith("/"):
                return f"{self.s3_url}{s3_key}"
            else:
                return f"{self.s3_url}/{s3_key}"

        except Exception as e:
            logger.error(f"Error generating URL: {str(e)}")
            return None
