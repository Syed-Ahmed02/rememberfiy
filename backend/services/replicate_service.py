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
            "quiz_generation": "openai/gpt-5-mini",  # Using gpt-5-mini for quiz generation
            "summarization": "openai/gpt-5-mini",    # Using gpt-5-mini for summarization
            "socratic_tutor": "openai/gpt-5-mini",   # Using gpt-5-mini for Socratic tutoring
            "image_to_text": "cuuupid/glm-4v-9b:69196a237cdc310988a4b12ad64f4b36d10189428c19a18526af708546e1856f",  # Using GLM-4V-9B for OCR
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

IMPORTANT: The correct_answer should be an integer index (0, 1, 2, or 3) representing the position of the correct option in the options array.

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

    async def extract_text_from_image(self, image_source: str) -> str:
        """
        Extract text and describe content from an image using GLM-4V-9B for OCR

        Args:
            image_source: Either a file path (local) or URL (remote) to the image

        Returns:
            Extracted text and description
        """
        try:
            logger.info(f"Extracting text from image using GLM-4V-9B: {image_source}")

            # Check if it's a URL or file path
            if image_source.startswith(('http://', 'https://')):
                # It's a URL - pass it directly
                image_input = image_source
            else:
                # It's a file path - open the file
                with open(image_source, "rb") as image_file:
                    image_input = image_file

            # Use GLM-4V-9B model for OCR (async call)
            output = await replicate.async_run(
                self.models["image_to_text"],
                input={
                    "image": image_input,
                    "top_k": 1,
                    "prompt": "Please identify and extract all text in the image. Include any handwritten text, printed text, or text in diagrams. Also describe any visual elements, charts, or diagrams you see.",
                    "max_length": 1024
                }
            )

            # Extract text from output (GLM-4V-9B may return streaming output)
            text = ""

            # Debug: log the output type
            logger.info(f"GLM-4V-9B output type: {type(output)}")
            logger.info(f"GLM-4V-9B output: {str(output)[:200]}...")

            # Handle different output types from replicate.async_run()
            if isinstance(output, list):
                # Handle list output (streaming)
                logger.info(f"Processing list output with {len(output)} items")
                for item in output:
                    if hasattr(item, 'read'):
                        # Handle FileOutput objects
                        text += item.read().decode('utf-8')
                    else:
                        text += str(item)
            elif hasattr(output, '__aiter__'):
                # Handle async generator output (GLM-4V-9B streaming)
                logger.info("Processing async generator output")
                try:
                    item_count = 0
                    async for item in output:
                        item_count += 1
                        logger.info(f"Async generator yielded item {item_count}: type={type(item)}, content={str(item)[:200]}...")
                        if hasattr(item, 'read'):
                            # Handle FileOutput objects
                            try:
                                decoded_content = item.read().decode('utf-8')
                                logger.info(f"FileOutput decoded: {decoded_content[:100]}...")
                                text += decoded_content
                            except Exception as e:
                                logger.error(f"Error decoding FileOutput: {e}")
                                text += str(item)
                        elif isinstance(item, (str, bytes)):
                            # Handle string or bytes
                            if isinstance(item, bytes):
                                try:
                                    text += item.decode('utf-8')
                                except Exception as e:
                                    logger.error(f"Error decoding bytes: {e}")
                                    text += str(item)
                            else:
                                text += item
                        else:
                            # Handle other types
                            logger.warning(f"Unknown item type: {type(item)}")
                            text += str(item)
                    logger.info(f"Async generator yielded {item_count} items total")
                except TypeError as e:
                    logger.error(f"Async generator TypeError: {e}")
                    # Fallback: convert to string
                    text = str(output)
            elif hasattr(output, '__iter__') and not isinstance(output, str):
                # Handle iterator output (including Future objects)
                logger.info("Processing regular iterator output")
                try:
                    item_count = 0
                    for item in output:
                        item_count += 1
                        logger.info(f"Iterator yielded item {item_count}: type={type(item)}, content={str(item)[:200]}...")
                        if hasattr(item, 'read'):
                            # Handle FileOutput objects
                            try:
                                decoded_content = item.read().decode('utf-8')
                                logger.info(f"Iterator FileOutput decoded: {decoded_content[:100]}...")
                                text += decoded_content
                            except Exception as e:
                                logger.error(f"Error decoding iterator FileOutput: {e}")
                                text += str(item)
                        elif isinstance(item, (str, bytes)):
                            # Handle string or bytes
                            if isinstance(item, bytes):
                                try:
                                    text += item.decode('utf-8')
                                except Exception as e:
                                    logger.error(f"Error decoding iterator bytes: {e}")
                                    text += str(item)
                            else:
                                text += item
                        else:
                            # Handle other types
                            logger.warning(f"Iterator unknown item type: {type(item)}")
                            text += str(item)
                    logger.info(f"Iterator yielded {item_count} items total")
                except TypeError as e:
                    logger.error(f"Iterator TypeError: {e}")
                    # If it's a Future object, get its result
                    if hasattr(output, 'result'):
                        result = output.result()
                        text = str(result)
                    else:
                        text = str(output)
            elif hasattr(output, 'read'):
                # Handle FileOutput objects
                logger.info("Processing FileOutput object")
                text = output.read().decode('utf-8')
            else:
                # Handle single output
                logger.info("Processing single output")
                text = str(output)

            logger.info(f"Extracted text length: {len(text)} characters")
            logger.info(f"Extracted text preview: {text[:200] if text else 'EMPTY'}")

            return text.strip()

        except Exception as e:
            logger.error(f"Error extracting text from image with GLM-4V-9B: {str(e)}")
            raise ValueError(f"GLM-4V-9B OCR failed: {str(e)}")

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
