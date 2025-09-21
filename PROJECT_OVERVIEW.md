# Remberify - Project Overview

## 🎯 Project Vision
Remberify is a hackathon project designed to help users remember what they learn through AI-powered content analysis, quiz generation, and spaced repetition. The app combines modern web technologies with AI to create an intelligent learning companion.

## 🏗️ Current Architecture

### Frontend (Next.js + Tailwind)
- **Framework**: Next.js 14.2.25 with React 19
- **Styling**: Tailwind CSS 4.1.9 with shadcn/ui components
- **State Management**: React hooks (useState)
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React icons

### Backend (FastAPI + Python)
- **Framework**: FastAPI (basic setup)
- **AI Integration**: LangChain + LangGraph + OpenAI (planned)
- **File Processing**: PyPDF2 for PDF parsing
- **Data Validation**: Pydantic

### Database & Services
- **Database**: Supabase (planned)
- **Authentication**: Clerk (planned)
- **AI Services**: Replicate API (planned)

## 📱 Current Implementation Status

### ✅ Completed Features
1. **Basic App Structure**
   - Multi-screen navigation (Dashboard, Upload, Quiz, Tutor)
   - Responsive design with Tailwind CSS
   - Component-based architecture

2. **Upload Screen**
   - PDF upload interface (drag & drop)
   - Text input area
   - AI summary generation (simulated)
   - Loading states and animations

3. **Dashboard Screen**
   - Quiz overview with mock data
   - Review scheduling display
   - Performance metrics
   - Difficulty indicators
   - Due date tracking

4. **Quiz Screen**
   - Multiple choice questions
   - Short answer questions
   - Progress tracking
   - Score calculation
   - Spaced repetition recommendations
   - Tutor integration

5. **Tutor Screen**
   - Chat interface
   - Socratic questioning (simulated)
   - Context-aware responses
   - Message history

### 🚧 Partially Implemented
1. **Backend API**
   - Basic FastAPI setup
   - No actual endpoints implemented
   - Missing AI integration

2. **Data Persistence**
   - All data is currently in-memory
   - No database integration
   - No user authentication

### ❌ Missing Features
1. **Authentication System**
   - Clerk integration
   - User management
   - Session handling

2. **AI Integration**
   - Real quiz generation
   - Content summarization
   - Socratic tutoring logic

3. **File Processing**
   - PDF text extraction
   - Image processing
   - Content parsing

4. **Database Integration**
   - Supabase setup
   - User data storage
   - Quiz persistence
   - Review scheduling

5. **Loading States**
   - Global loading screen
   - API call indicators
   - Error handling

## 🎨 Design System

### Color Palette
- **Primary**: Blue-600 (#2563eb)
- **Secondary**: Gray-700 (#374151)
- **Background**: Gray-50 (#f9fafb)
- **Success**: Green-600 (#059669)
- **Warning**: Yellow-600 (#d97706)
- **Error**: Red-600 (#dc2626)

### Typography
- **Font**: Geist (sans-serif)
- **Headings**: Bold, gray-900
- **Body**: Regular, gray-600
- **UI Elements**: Medium weight

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Blue primary, outline secondary
- **Inputs**: Clean borders, focus states
- **Progress**: Blue gradient

## 🔄 User Flow

### 1. Upload Flow
```
User → Upload Screen → Content Processing → AI Summary → Action Buttons
```

### 2. Quiz Flow
```
Dashboard → Select Quiz → Quiz Screen → Question → Answer → Results → Next Review
```

### 3. Tutor Flow
```
Quiz Screen → "Go to Tutor" → Tutor Screen → Socratic Chat → Learning
```

## 🛠️ Technical Debt & Improvements Needed

### High Priority
1. **Backend Implementation**
   - Implement FastAPI endpoints
   - Add AI service integration
   - Set up file processing

2. **Authentication**
   - Integrate Clerk
   - Add user context
   - Implement protected routes

3. **Database Setup**
   - Configure Supabase
   - Design data schema
   - Implement CRUD operations

### Medium Priority
1. **Error Handling**
   - API error states
   - Network failure handling
   - User feedback

2. **Performance**
   - Loading optimizations
   - Code splitting
   - Image optimization

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

### Low Priority
1. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

2. **Analytics**
   - User behavior tracking
   - Performance metrics
   - Learning analytics

## 📊 Data Models (Planned)

### User
```typescript
interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  lastActiveAt: Date
}
```

### Quiz
```typescript
interface Quiz {
  id: string
  userId: string
  title: string
  content: string
  questions: Question[]
  createdAt: Date
  lastReviewedAt?: Date
  nextReviewAt: Date
  reviewCount: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
}
```

### Question
```typescript
interface Question {
  id: string
  type: 'multiple-choice' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
}
```

## 🚀 Next Steps for Hackathon

### Phase 1: Backend Foundation (2-3 hours)
1. Implement FastAPI endpoints
2. Set up AI service integration
3. Add file processing capabilities

### Phase 2: Authentication & Database (2-3 hours)
1. Integrate Clerk authentication
2. Set up Supabase database
3. Implement data persistence

### Phase 3: AI Integration (2-3 hours)
1. Real quiz generation
2. Content summarization
3. Socratic tutoring logic

### Phase 4: Polish & Demo (1-2 hours)
1. Loading states
2. Error handling
3. Demo preparation

## 🎯 Demo Scenarios

### Scenario 1: New User Journey
1. User signs up with Clerk
2. Uploads a PDF or pastes text
3. Views AI-generated summary
4. Takes generated quiz
5. Gets wrong answer, uses tutor
6. Completes quiz, sees review schedule

### Scenario 2: Returning User
1. User logs in
2. Sees dashboard with due quizzes
3. Takes overdue quiz
4. Updates review schedule
5. Creates new content

## 🔧 Development Commands

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📝 Notes for Hackathon

- **Time Constraint**: 8 hours total
- **Focus Areas**: Core functionality over polish
- **Demo Priority**: Upload → Quiz → Tutor flow
- **Technical Risk**: AI integration complexity
- **Fallback**: Simulated AI responses for demo

## 🎉 Success Metrics

- [ ] User can upload content and get summary
- [ ] Quiz generation works with real AI
- [ ] Tutor provides helpful Socratic guidance
- [ ] Review scheduling functions correctly
- [ ] Authentication works seamlessly
- [ ] Demo runs without errors

---

*This overview will be updated as the project progresses through the hackathon development phases.*
