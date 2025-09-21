# Remberify - Updated Implementation Plan

## 🎯 Hackathon Timeline: 8 Hours

### Phase 1: Backend Foundation (2-3 hours)
**Priority: CRITICAL** - This is the foundation everything else builds on

#### Task 1.1: Backend Project Structure (30 minutes)
- [ ] Create proper FastAPI project structure
- [ ] Set up virtual environment and dependencies
- [ ] Configure CORS for frontend communication
- [ ] Add environment variables for API keys
- [ ] Create basic error handling middleware

#### Task 1.2: Replicate AI Service Integration (45 minutes)
- [ ] Set up Replicate API client
- [ ] Create AI service wrapper class
- [ ] Implement content summarization using Replicate models
- [ ] Implement quiz generation using Replicate models
- [ ] Implement Socratic tutoring using Replicate models
- [ ] Add error handling for Replicate API calls
- [ ] Implement image processing for OCR 

#### Task 1.3: File Processing (45 minutes)
- [ ] Implement PDF text extraction with PyPDF2
- [ ] Add image upload handling (PNG, JPG, JPEG)
- [ ] Implement image-to-text extraction using Replicate OCR models
- [ ] Add file upload handling in FastAPI
- [ ] Create content parsing utilities
- [ ] Add file validation and error handling
- [ ] Support multiple file types: PDF, Images, Text

#### Task 1.4: API Endpoints (45 minutes)
- [ ] `/generate_quiz` - POST endpoint for quiz generation
- [ ] `/socratic` - POST endpoint for Socratic tutoring
- [ ] `/summary` - POST endpoint for content summarization
- [ ] `/upload` - POST endpoint for file uploads
- [ ] `/health` - GET endpoint for health checks
- [ ] Add request/response models with Pydantic
- [ ] Test all endpoints with Postman/curl

### Phase 2: Authentication & Database (2-3 hours)
**Priority: HIGH** - Required for user persistence

#### Task 2.1: Clerk Authentication Setup (60 minutes)
- [ ] Create Clerk account and project
- [ ] Install Clerk SDK in frontend
- [ ] Set up authentication components
- [ ] Create protected route wrapper
- [ ] Add user context provider
- [ ] Test login/logout flow

#### Task 2.2: Convex Database Setup (60 minutes)
- [ ] Create Convex project
- [ ] Install Convex SDK
- [ ] Design database schema:
  - `users` table
  - `quizzes` table
  - `questions` table
  - `quiz_attempts` table
- [ ] Set up Convex functions (mutations and queries)
- [ ] Create database schema files
- [ ] Test database operations

#### Task 2.3: Backend Convex Integration (60 minutes)
- [ ] Install Convex Python client
- [ ] Create Convex service layer
- [ ] Implement CRUD operations for quizzes
- [ ] Implement user data persistence
- [ ] Add database error handling
- [ ] Test database operations

### Phase 3: Frontend Integration (2-3 hours)
**Priority: HIGH** - Connect frontend to real backend

#### Task 3.1: API Client Setup (30 minutes)
- [ ] Create API client service
- [ ] Add environment variables for backend URL
- [ ] Implement error handling for API calls
- [ ] Add loading states for API requests
- [ ] Create TypeScript interfaces for API responses

#### Task 3.2: Upload Screen Integration (60 minutes)
- [ ] Connect file upload to backend
- [ ] Implement real PDF processing
- [ ] Implement real image processing
- [ ] Connect to AI summary endpoint
- [ ] Add proper error handling
- [ ] Update loading states
- [ ] Add image preview functionality

#### Task 3.3: Quiz Generation Integration (45 minutes)
- [ ] Connect quiz generation to backend
- [ ] Implement real quiz data flow
- [ ] Add quiz persistence to Convex
- [ ] Update quiz state management
- [ ] Test quiz generation flow

#### Task 3.4: Tutor Integration (30 minutes)
- [ ] Connect Socratic tutoring to backend
- [ ] Implement real AI responses using Replicate
- [ ] Add conversation persistence
- [ ] Update tutor state management
- [ ] Test tutor functionality

#### Task 3.5: Dashboard Integration (30 minutes)
- [ ] Connect dashboard to Convex
- [ ] Implement real quiz data loading
- [ ] Add user-specific data filtering
- [ ] Update review scheduling logic
- [ ] Test dashboard functionality

### Phase 4: Polish & Demo (1-2 hours)
**Priority: MEDIUM** - Essential for demo success

#### Task 4.1: Loading States & Error Handling (45 minutes)
- [ ] Add global loading screen
- [ ] Implement error boundaries
- [ ] Add toast notifications for errors
- [ ] Create fallback UI components
- [ ] Test error scenarios

#### Task 4.2: Demo Preparation (30 minutes)
- [ ] Create demo content (sample PDFs, images, text)
- [ ] Prepare demo script
- [ ] Test complete user flows
- [ ] Create backup demo scenarios
- [ ] Document demo steps

#### Task 4.3: Final Testing & Bug Fixes (45 minutes)
- [ ] End-to-end testing
- [ ] Fix critical bugs
- [ ] Performance optimization
- [ ] Mobile responsiveness check
- [ ] Final demo run-through

## 📋 Detailed Task Breakdown

### Backend Tasks

#### 1. FastAPI Project Structure
```python
# Project structure to create:
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Dependencies
├── .env                   # Environment variables
├── services/
│   ├── replicate_service.py # Replicate AI integration
│   ├── file_service.py    # File processing
│   └── convex_service.py  # Convex database operations
├── models/
│   ├── quiz.py           # Pydantic models
│   └── user.py           # User models
├── routers/
│   ├── quiz.py           # Quiz endpoints
│   ├── tutor.py          # Tutor endpoints
│   └── upload.py         # Upload endpoints
└── utils/
    ├── config.py         # Configuration
    └── exceptions.py     # Custom exceptions
```

#### 2. Replicate AI Service Implementation
```python
# Key functions to implement:
- generate_quiz(content: str) -> List[Question]
- generate_summary(content: str) -> str
- socratic_response(question: str, user_answer: str, attempts: int) -> str
- extract_text_from_image(image_path: str) -> str
- calculate_review_date(score: float, total_questions: int) -> datetime

# Replicate Models to use:
- "meta/llama-2-70b-chat" for quiz generation
- "meta/llama-2-70b-chat" for summarization
- "meta/llama-2-70b-chat" for Socratic tutoring
- "salesforce/blip" for image captioning
- "jagilley/controlnet-scribble" for OCR if needed
```

#### 3. Convex Database Schema
```javascript
// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  quizzes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    fileType: v.string(), // "pdf", "image", "text"
    fileName: v.optional(v.string()),
    createdAt: v.number(),
    lastReviewedAt: v.optional(v.number()),
    nextReviewAt: v.number(),
    reviewCount: v.number(),
    difficulty: v.string(), // "Easy", "Medium", "Hard"
  }).index("by_user", ["userId"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    questionText: v.string(),
    questionType: v.string(), // "multiple-choice", "short-answer"
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    explanation: v.string(),
    orderIndex: v.number(),
  }).index("by_quiz", ["quizId"]),

  quizAttempts: defineTable({
    quizId: v.id("quizzes"),
    userId: v.id("users"),
    score: v.number(),
    totalQuestions: v.number(),
    completedAt: v.number(),
    answers: v.array(v.any()),
  }).index("by_quiz", ["quizId"]).index("by_user", ["userId"]),
});
```

### Frontend Tasks

#### 1. Authentication Integration
```typescript
// Components to create/update:
- AuthProvider.tsx          # Clerk provider wrapper
- ProtectedRoute.tsx        # Route protection
- UserContext.tsx          # User state management
- LoginButton.tsx          # Login/logout button
```

#### 2. API Client
```typescript
// Services to create:
- api/client.ts            # Axios/fetch client
- api/quiz.ts             # Quiz API calls
- api/tutor.ts            # Tutor API calls
- api/upload.ts           # Upload API calls
- types/api.ts            # TypeScript interfaces
```

#### 3. Upload Screen Updates
```typescript
// New upload options to add:
- Image upload (PNG, JPG, JPEG)
- Image preview functionality
- File type validation
- Progress indicators for different file types
- Support for multiple file formats
```

#### 4. State Management Updates
```typescript
// State updates needed:
- Add user context to all components
- Update quiz state to include Convex IDs
- Add loading states for all API calls
- Implement error handling in all screens
- Add file type tracking in upload state
```

## 🚨 Risk Mitigation

### High-Risk Areas
1. **Replicate API Rate Limits**: Implement caching and fallback responses
2. **Convex Connection Issues**: Add connection pooling and retry logic
3. **File Upload Failures**: Implement chunked uploads and progress tracking
4. **Image Processing Delays**: Add loading states and timeout handling
5. **Authentication Edge Cases**: Add proper error handling for auth failures

### Fallback Strategies
1. **Replicate Service Down**: Use pre-generated responses for demo
2. **Convex Issues**: Implement local storage fallback
3. **File Processing Fails**: Allow text-only input
4. **Network Issues**: Add offline mode indicators
5. **Image Processing Fails**: Fallback to manual text input

## 📊 Success Metrics

### Technical Metrics
- [ ] All API endpoints respond within 2 seconds
- [ ] File uploads work for PDFs up to 10MB and images up to 5MB
- [ ] Quiz generation completes within 30 seconds
- [ ] Image processing completes within 15 seconds
- [ ] Authentication flow works seamlessly
- [ ] Convex operations are reliable

### Demo Metrics
- [ ] Complete user journey works end-to-end
- [ ] Demo can be completed in under 5 minutes
- [ ] No critical errors during demo
- [ ] Mobile responsiveness maintained
- [ ] Loading states provide good UX
- [ ] All file types (PDF, image, text) work

## 🎯 Demo Scenarios

### Primary Demo (5 minutes)
1. **User Registration** (30 seconds)
   - Sign up with Clerk
   - Verify email

2. **Content Upload** (1.5 minutes)
   - Upload sample PDF, image, or paste text
   - View AI-generated summary
   - Show different file type handling

3. **Quiz Generation** (2 minutes)
   - Generate quiz from content
   - Answer 3-4 questions
   - Get wrong answer, use tutor

4. **Tutor Interaction** (1 minute)
   - Ask tutor for help
   - Receive Socratic guidance

5. **Dashboard Review** (30 seconds)
   - View quiz in dashboard
   - See review schedule

### Backup Demo (3 minutes)
- Use pre-uploaded content
- Skip authentication
- Focus on AI features and file processing

## 🔧 Development Commands

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Convex Setup
```bash
# Install Convex CLI
npm install -g convex

# Initialize Convex
npx convex dev

# Deploy to production
npx convex deploy
```

## 📝 Environment Variables

### Backend (.env)
```
REPLICATE_API_TOKEN=your_replicate_token
CONVEX_DEPLOYMENT=your_convex_deployment
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### Convex (convex.json)
```json
{
  "functions": "convex/",
  "generateCommonJSApi": false,
  "node": {
    "18": true
  }
}
```

## 🎉 Final Checklist

### Before Demo
- [ ] All features working end-to-end
- [ ] Demo content prepared (PDF, images, text)
- [ ] Backup scenarios ready
- [ ] Error handling tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Demo script practiced

### During Demo
- [ ] Start with user registration
- [ ] Show content upload (try different file types)
- [ ] Demonstrate quiz generation
- [ ] Use tutor for wrong answer
- [ ] Show dashboard and review scheduling
- [ ] Handle any errors gracefully
- [ ] Keep demo under 5 minutes

## 🔄 Updated Dependencies

### Backend Requirements
```
fastapi
uvicorn
replicate
python-multipart
pypdf2
pillow
python-dotenv
convex
```

### Frontend Dependencies
```
@clerk/nextjs
convex
convex/react
```

---

*This updated implementation plan incorporates Convex as the database, Replicate for AI models, and adds image upload support to the upload screen.*
