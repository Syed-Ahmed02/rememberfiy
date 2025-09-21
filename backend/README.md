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
   REPLICATE_API_TOKEN=your_replicate_api_token_here
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
- `POST /api/upload` - Upload and process files (PDF, images)
- `POST /api/upload_text` - Upload text content directly

### Health Check
- `GET /` - API information
- `GET /health` - Health check with service status

## Models Used

### Quiz Generation & Text Processing
- **Model**: meta/llama-3-8b-instruct
- **Purpose**: Generate quiz questions, summaries, and tutoring responses
- **API**: Replicate streaming API for real-time responses

### Image Processing
- **Model**: andreasjansson/blip-2
- **Purpose**: Extract text and describe content from images
- **Features**: Image captioning and OCR capabilities

## Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── services/
│   ├── replicate_service.py # AI model integration
│   └── file_service.py     # File processing utilities
├── models/
│   └── quiz.py            # Pydantic data models
├── routers/
│   ├── quiz.py            # Quiz-related endpoints
│   └── upload.py          # File upload endpoints
└── utils/
    └── ...                # Utility functions
```

## Error Handling

- Global error handling middleware
- Custom exception handlers for HTTP and validation errors
- Detailed logging for debugging
- Graceful fallback responses when AI services fail

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
- PNG, JPG, JPEG (OCR with pytesseract)
- Text files (direct reading)

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Quiz generation
curl -X POST http://localhost:8000/api/generate_quiz \
  -H "Content-Type: application/json" \
  -d '{"content": "Your content here", "difficulty": "medium", "num_questions": 3}'

# File upload
curl -X POST http://localhost:8000/api/upload \
  -F "file=@your_file.pdf" \
  -F "content_type=pdf"
```

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
