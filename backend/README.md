# Remberify Backend API

AI-powered learning platform backend with FastAPI, Replicate integration, and file processing capabilities.

## Features

- 📝 Quiz generation from text content using AI
- 🤖 Socratic tutoring with AI guidance
- 📄 Content summarization
- 📎 File upload and processing (PDF, Images, Text)
- 🔄 Spaced repetition learning algorithms

## Setup

### Prerequisites

- Python 3.8+
- Replicate API token
- Dependencies from `requirements.txt`

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   # AI Service
   REPLICATE_API_TOKEN=your_replicate_api_token_here

   # S3 Storage (required for file uploads)
   S3_STORAGE_URL=https://your-s3-bucket.s3.amazonaws.com
   S3_ACCESS_KEY=your_s3_access_key
   S3_SECRET_ACCESS_KEY=your_s3_secret_key

   # Optional
   DEBUG=True
   LOG_LEVEL=INFO
   ```

3. **Run the server:**
   ```bash
   # Option 1: Run as module (recommended)
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

   # Option 2: From backend directory
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Quiz Generation
- `POST /api/generate_quiz` - Generate quiz questions from content
- `POST /api/summary` - Generate content summary
- `POST /api/socratic` - Get Socratic tutoring response

### File Upload
- `POST /api/upload` - Upload and process files (PDF, images) - Returns S3 URL
- `POST /api/upload_image` - Upload images with specialized S3 handling - Returns S3 URL
- `POST /api/upload_text` - Upload text content directly

### Health Check
- `GET /` - API information
- `GET /health` - Health check with service status

## Models Used

### Quiz Generation & Text Processing
- **Model**: meta/llama-3-8b-instruct
- **Purpose**: Generate quiz questions, summaries, and tutoring responses
- **API**: Replicate streaming API for real-time responses

### Image Processing (OCR)
- **Model**: cuuupid/glm-4v-9b
- **Purpose**: Advanced OCR and text extraction from images
- **Features**: Superior text recognition, handles handwritten text, diagrams, and complex layouts
- **Processing Flow**:
  1. Images are uploaded to S3 storage first
  2. S3 URL is obtained
  3. S3 URL is sent to GLM-4V-9B model for OCR processing
- **Benefits**: No local file processing, better scalability, URL-based processing
- **Requirement**: Replicate API token required for OCR functionality

## Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── services/
│   ├── replicate_service.py # AI model integration
│   ├── file_service.py     # File processing utilities
│   └── s3_service.py       # S3 storage integration
├── models/
│   └── quiz.py            # Pydantic data models
├── routers/
│   ├── quiz.py            # Quiz-related endpoints
│   └── upload.py          # File upload endpoints
└── utils/
    └── ...                # Utility functions
```

## Cloud Storage Integration

The backend now supports S3-compatible storage for file uploads:

### S3 Features
- ✅ **Automatic Upload**: Files uploaded via `/api/upload` are stored in S3
- ✅ **Public Access**: Files are made publicly accessible via S3 URLs
- ✅ **Organized Storage**: Files organized by user ID (when available)
- ✅ **Image Specialization**: Images get dedicated `/images/` folders with metadata
- ✅ **Image-Only Endpoint**: `/api/upload_image` for image-specific handling
- ✅ **Multiple Formats**: Support for PDF, PNG, JPG, JPEG, GIF, WebP, SVG
- ✅ **Image Validation**: Specific validation for image file types
- ✅ **Error Handling**: Graceful fallback if S3 is unavailable

### File Flow
1. **Upload** → User uploads file via frontend
2. **Validation** → File type and size validation
3. **S3 Storage** →
   - Images: Stored in organized `/images/` folders with metadata
   - PDFs: Stored in general uploads folder
4. **Processing** → File content extracted for AI processing
5. **Response** → Return S3 URL for file access + extracted content
6. **Cleanup** → Temporary processing files deleted

### S3 Response Format
```json
{
  "content": "Extracted text content...",
  "summary": "AI-generated summary...",
  "file_type": "PDF document",
  "file_name": "document.pdf",
  "file_url": "https://your-s3-bucket.s3.amazonaws.com/uploads/20250121_123456_file.pdf",
  "processed_at": "2025-01-21T12:34:56"
}
```

## Error Handling

- Global error handling middleware
- Custom exception handlers for HTTP and validation errors
- Detailed logging for debugging
- Graceful fallback responses when AI services fail

## Testing the API

### Quick Test

1. **Test with the provided test script:**
   ```bash
   # From the backend directory
   cd backend
   python test_async_fix.py
   ```

2. **Interactive Documentation (Swagger UI)**

   **Start the server:**
   ```bash
   # From the project root
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

   # OR from the backend directory
   cd backend
   python main.py
   ```

   **Access the interactive documentation:**
   - Open your browser: `http://localhost:8000/docs`
   - OR: `http://localhost:8000/redoc` (alternative documentation)

   **Test Endpoints:**
   - Use the Swagger UI to test all endpoints interactively
   - Upload files directly through the web interface
   - See real-time API responses

### Manual Testing with curl

#### Test Image Upload:
```bash
curl -X POST "http://localhost:8000/api/upload_image" \
  -F "file=@/path/to/your/image.png" \
  -F "user_id=optional_user_id"
```

#### Test General Upload with Image:
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@/path/to/your/image.png" \
  -F "content_type=image"
```

#### Test General Upload:
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@/path/to/your/file.pdf" \
  -F "content_type=pdf"
```

#### Test Text Upload:
```bash
curl -X POST "http://localhost:8000/api/upload_text" \
  -H "Content-Type: application/json" \
  -d '{"content": "Your text content here", "file_name": "notes.txt"}'
```

## Development

### Adding New Models

To add new AI models:

1. Update the `models` dictionary in `ReplicateService`
2. Add corresponding methods in the service class
3. Create API endpoints in the routers
4. Update Pydantic models if needed

### File Processing

Current supported file types:
- PDF (text extraction with PyPDF2)
- PNG, JPG, JPEG, GIF, WebP, SVG (OCR with GLM-4V-9B via Replicate)
- Text files (direct reading)

## Testing

### Quick Start Testing

1. **Start the server:**
   ```bash
   # From the project root
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

   # OR from the backend directory
   cd backend
   python main.py
   ```

2. **Run the demo script:**
   ```bash
   cd backend
   python demo_api_test.py
   ```

3. **Test with your own files:**
   ```bash
   # Health check
   curl http://localhost:8000/health

   # Quiz generation
   curl -X POST http://localhost:8000/api/generate_quiz \
     -H "Content-Type: application/json" \
     -d '{"content": "Your content here", "difficulty": "medium", "num_questions": 3}'

   # Image upload
   curl -X POST "http://localhost:8000/api/upload_image" \
     -F "file=@/path/to/your/image.png"

   # File upload
   curl -X POST "http://localhost:8000/api/upload" \
     -F "file=@/path/to/your/file.pdf" \
     -F "content_type=pdf"
   ```

### Interactive Testing

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Demo Scripts

- `demo_api_test.py` - Demonstrates API functionality with sample data
- `test_image_upload.py` - Tests image upload functionality (requires actual files)
- `test_s3_integration.py` - Tests S3 storage functionality

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REPLICATE_API_TOKEN` | Replicate API token | Yes |
| `DEBUG` | Enable debug mode | No |
| `LOG_LEVEL` | Logging level (INFO, DEBUG, ERROR) | No |

## Next Steps

1. **Database Integration**: Connect to Convex for data persistence
2. **Authentication**: Integrate with Clerk for user management
3. **Frontend Integration**: Replace simulated data with real API calls
4. **Testing**: Add comprehensive test coverage
5. **Deployment**: Set up production deployment pipeline
