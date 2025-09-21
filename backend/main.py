from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Remberify API",
    description="AI-powered learning platform with quiz generation and Socratic tutoring",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Remberify API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# TODO: Add API endpoints for:
# - /generate_quiz
# - /socratic  
# - /summary
# - /upload