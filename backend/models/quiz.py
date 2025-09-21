"""
Pydantic models for quiz-related data structures
"""

from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union
from datetime import datetime

class Question(BaseModel):
    """Model for a single quiz question"""
    question: str
    options: Optional[List[str]] = None
    correct_answer: Union[str, int]
    explanation: str
    question_type: str = "multiple-choice"  # "multiple-choice" or "short-answer"

class QuizRequest(BaseModel):
    """Model for quiz generation request"""
    content: str
    difficulty: str = "medium"  # "easy", "medium", "hard"
    num_questions: int = 5
    file_type: Optional[str] = None
    file_name: Optional[str] = None

class QuizResponse(BaseModel):
    """Model for quiz generation response"""
    questions: List[Question]
    summary: Optional[str] = None
    estimated_time: int = 10  # minutes

class SocraticRequest(BaseModel):
    """Model for Socratic tutoring request"""
    question: str
    user_answer: str
    attempts: int = 1
    context: Optional[str] = None

class SocraticResponse(BaseModel):
    """Model for Socratic tutoring response"""
    response: str
    hints: Optional[List[str]] = None
    next_question: Optional[str] = None

class SummaryRequest(BaseModel):
    """Model for content summarization request"""
    content: str
    max_length: Optional[int] = 500  # characters

class SummaryResponse(BaseModel):
    """Model for content summarization response"""
    summary: str
    key_points: Optional[List[str]] = None
    word_count: int

class UploadRequest(BaseModel):
    """Model for file upload request"""
    content: str
    file_type: str  # "pdf", "image", "text"
    file_name: Optional[str] = None

class UploadResponse(BaseModel):
    """Model for file upload response"""
    content: str
    summary: str
    file_type: str
    file_name: Optional[str] = None
    file_url: Optional[str] = None  # S3 URL for accessing the uploaded file
    processed_at: datetime

class QuizAttempt(BaseModel):
    """Model for quiz attempt tracking"""
    quiz_id: str
    user_id: str
    score: int
    total_questions: int
    answers: List[Dict[str, Any]]
    completed_at: datetime

class ReviewSchedule(BaseModel):
    """Model for spaced repetition review schedule"""
    quiz_id: str
    user_id: str
    next_review_date: datetime
    difficulty: str
    review_count: int
    last_score: Optional[float] = None
