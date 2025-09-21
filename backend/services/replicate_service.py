"""
Replicate AI Service Integration
Handles all AI operations using Replicate models:
- GPT-4o mini for quiz generation and text processing
- GLM-4V-9B for image to text processing
"""

import replicate
import os
from typing import List, Dict, Optional, Any
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ReplicateService:
    """Service class for interacting with Replicate AI models"""

    def __init__(self):
        """Initialize the Replicate service with API key"""
        self.api_token = os.getenv("REPLICATE_API_TOKEN")
        if not self.api_token:
            raise ValueError("REPLICATE_API_TOKEN environment variable is required")

        # Initialize replicate client
        replicate.api_token = self.api_token

        # Model configurations
        self.models = {
            "quiz_generation": "meta/meta-llama-3-8b-instruct",  # Using Llama 3 for quiz generation
            "summarization": "meta/meta-llama-3-8b-instruct",    # Using Llama 3 for summarization
            "socratic_tutor": "meta/meta-llama-3-8b-instruct",   # Using Llama 3 for Socratic tutoring
            "image_to_text": "andreasjansson/blip-2",           # Using BLIP-2 for image captioning
        }

    async def generate_quiz(self, content: str, difficulty: str = "medium", num_questions: int = 5) -> List[Dict[str, Any]]:
        """
        Generate quiz questions from content using AI

        Args:
            content: The text content to generate questions from
            difficulty: Difficulty level (easy, medium, hard)
            num_questions: Number of questions to generate

        Returns:
            List of question dictionaries with question, options, correct_answer, explanation
        """
        try:
            logger.info(f"Generating {num_questions} {difficulty} quiz questions from content")

            # Create prompt for quiz generation
            prompt = f"""
You are an expert educational content creator. Create {num_questions} multiple-choice questions from the following content.

Content: {content}

Requirements:
- Difficulty level: {difficulty}
- Each question should have 4 options (A, B, C, D)
- Only one correct answer per question
- Include a brief explanation for each question
- Questions should test understanding, not just memorization
- Mix of question types: factual, conceptual, application-based

Return the questions in this exact JSON format:
{{
    "questions": [
        {{
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "explanation": "Brief explanation of why this is correct"
        }}
    ]
}}

Return only valid JSON, no additional text.
"""

            # Use replicate to run the model
            output = replicate.run(
                self.models["quiz_generation"],
                input={
                    "prompt": prompt,
                    "max_tokens": 2000,
                    "temperature": 0.7,
                    "top_p": 0.9
                }
            )

            # Parse the output
            result_text = ""
            if isinstance(output, list):
                result_text = "".join(output)
            else:
                result_text = str(output)

            # Extract JSON from the response
            import json
            import re

            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                    return result.get("questions", [])
                except json.JSONDecodeError:
                    logger.error("Failed to parse JSON from quiz generation response")
                    return []

            # Fallback: create basic questions if JSON parsing fails
            return self._generate_fallback_questions(content, num_questions)

        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            return self._generate_fallback_questions(content, num_questions)

    def _generate_fallback_questions(self, content: str, num_questions: int) -> List[Dict[str, Any]]:
        """Generate basic fallback questions when AI fails"""
        logger.info("Using fallback question generation")

        # Split content into sentences for basic question generation
        sentences = content.split('.')
        questions = []

        for i in range(min(num_questions, len(sentences))):
            if len(sentences[i].strip()) > 20:  # Only use substantial sentences
                questions.append({
                    "question": f"What is mentioned about: {sentences[i].strip()[:100]}...?",
                    "options": [
                        "It is described in detail",
                        "It is mentioned briefly",
                        "It is the main focus",
                        "It is not mentioned"
                    ],
                    "correct_answer": 0,
                    "explanation": "This is a fallback question generated when AI processing fails"
                })

        return questions

    async def generate_summary(self, content: str) -> str:
        """
        Generate a concise summary of the provided content

        Args:
            content: The text content to summarize

        Returns:
            Summary text
        """
        try:
            logger.info("Generating summary from content")

            prompt = f"""
Summarize the following content in 3-5 bullet points, focusing on the key concepts and main ideas:

{content}

Return only the bullet points, no additional text.
"""

            output = replicate.run(
                self.models["summarization"],
                input={
                    "prompt": prompt,
                    "max_tokens": 500,
                    "temperature": 0.3,
                    "top_p": 0.9
                }
            )

            # Extract summary text
            if isinstance(output, list):
                summary = "".join(output)
            else:
                summary = str(output)

            return summary.strip()

        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            # Fallback: return first few sentences
            sentences = content.split('.')[:3]
            return '. '.join(sentences) + '.'

    async def socratic_response(self, question: str, user_answer: str, attempts: int = 1) -> str:
        """
        Generate a Socratic tutoring response to guide the user

        Args:
            question: The original question
            user_answer: User's answer
            attempts: Number of attempts the user has made

        Returns:
            Socratic response to guide learning
        """
        try:
            logger.info(f"Generating Socratic response for attempt {attempts}")

            # Adjust approach based on attempts
            if attempts == 1:
                approach = "Ask probing questions to help them think through the problem"
            elif attempts == 2:
                approach = "Provide hints and ask more directed questions"
            else:
                approach = "Explain the concept more directly while still encouraging thinking"

            prompt = f"""
You are a Socratic tutor helping a student learn. {approach}.

Original question: {question}
Student's answer: {user_answer}

Respond in a way that:
- Doesn't give the answer directly
- Asks questions that make them think
- Provides hints when appropriate
- Encourages deeper understanding
- Keeps the response conversational and supportive

Your response should be 2-4 sentences long.
"""

            output = replicate.run(
                self.models["socratic_tutor"],
                input={
                    "prompt": prompt,
                    "max_tokens": 300,
                    "temperature": 0.8,
                    "top_p": 0.9
                }
            )

            # Extract response text
            if isinstance(output, list):
                response = "".join(output)
            else:
                response = str(output)

            return response.strip()

        except Exception as e:
            logger.error(f"Error generating Socratic response: {str(e)}")
            return "That's an interesting approach. Can you tell me what led you to that conclusion? What other aspects of this concept should we consider?"

    async def extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text and describe content from an image using AI

        Args:
            image_path: Path to the image file

        Returns:
            Extracted text and description
        """
        try:
            logger.info(f"Extracting text from image: {image_path}")

            # Open the image file
            with open(image_path, "rb") as image_file:
                output = replicate.run(
                    self.models["image_to_text"],
                    input={
                        "image": image_file,
                        "caption": True,
                        "context": "This image may contain text, diagrams, or educational content. Please extract all visible text and describe any visual elements."
                    }
                )

            # Extract text from output
            if isinstance(output, list):
                text = "".join(output)
            else:
                text = str(output)

            return text.strip()

        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return f"Error processing image: {str(e)}"

    def calculate_review_date(self, score: float, total_questions: int) -> datetime:
        """
        Calculate the next review date based on quiz performance

        Args:
            score: Number of correct answers
            total_questions: Total number of questions

        Returns:
            Next review datetime
        """
        percentage = (score / total_questions) * 100
        today = datetime.now()

        # Spaced repetition algorithm
        if percentage >= 90:
            days_to_add = 7  # Review in 1 week
        elif percentage >= 80:
            days_to_add = 3  # Review in 3 days
        elif percentage >= 70:
            days_to_add = 2  # Review in 2 days
        else:
            days_to_add = 1  # Review tomorrow

        next_review = today.replace(hour=9, minute=0, second=0, microsecond=0)
        next_review = next_review.replace(day=next_review.day + days_to_add)

        return next_review
