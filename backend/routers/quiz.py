"""
Quiz-related API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.quiz import QuizRequest, QuizResponse, Question
from services.replicate_service import ReplicateService
from services.file_service import FileProcessingService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
replicate_service = ReplicateService()
file_service = FileProcessingService()

@router.post("/generate_quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """
    Generate quiz questions from provided content

    Args:
        request: QuizRequest with content and parameters

    Returns:
        QuizResponse with generated questions
    """
    try:
        logger.info(f"Generating quiz with {request.num_questions} questions, difficulty: {request.difficulty}")

        # Generate quiz questions using AI
        questions_data = await replicate_service.generate_quiz(
            content=request.content,
            difficulty=request.difficulty,
            num_questions=request.num_questions
        )

        # Convert to Question models
        questions = []
        for q_data in questions_data:
            question = Question(
                question=q_data.get("question", ""),
                options=q_data.get("options", []),
                correct_answer=q_data.get("correct_answer", ""),
                explanation=q_data.get("explanation", "")
            )
            questions.append(question)

        # Generate summary if not provided
        summary = request.content[:200] + "..." if len(request.content) > 200 else request.content

        return QuizResponse(
            questions=questions,
            summary=summary,
            estimated_time=request.num_questions * 2  # 2 minutes per question
        )

    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.post("/summary", response_model=dict)
async def generate_summary(content: str, max_length: int = 500):
    """
    Generate a summary of the provided content

    Args:
        content: Text content to summarize
        max_length: Maximum length of summary in characters

    Returns:
        Dict with summary text
    """
    try:
        logger.info("Generating summary from content")

        summary = await replicate_service.generate_summary(content)

        return {
            "summary": summary,
            "max_length": max_length,
            "actual_length": len(summary)
        }

    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@router.post("/socratic", response_model=dict)
async def socratic_tutor(question: str, user_answer: str, attempts: int = 1):
    """
    Generate Socratic tutoring response

    Args:
        question: The original question
        user_answer: User's answer
        attempts: Number of attempts made

    Returns:
        Dict with Socratic response
    """
    try:
        logger.info(f"Generating Socratic response for attempt {attempts}")

        response = await replicate_service.socratic_response(
            question=question,
            user_answer=user_answer,
            attempts=attempts
        )

        return {
            "response": response,
            "attempts": attempts + 1  # Increment for next call
        }

    except Exception as e:
        logger.error(f"Error generating Socratic response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Socratic response: {str(e)}")
