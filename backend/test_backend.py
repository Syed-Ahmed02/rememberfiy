#!/usr/bin/env python3
"""
Simple test script to verify backend functionality
Run this script to test if the backend imports work correctly
"""

def test_imports():
    """Test that all imports work correctly"""
    try:
        print("Testing imports...")

        # Add current directory to path for absolute imports
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

        # Test main.py imports
        from main import app
        print("✅ main.py imports successful")

        # Test router imports
        from routers.quiz import router as quiz_router
        from routers.upload import router as upload_router
        print("✅ Router imports successful")

        # Test service imports
        from services.replicate_service import ReplicateService
        from services.file_service import FileProcessingService
        print("✅ Service imports successful")

        # Test model imports
        from models.quiz import QuizRequest, QuizResponse, Question
        print("✅ Model imports successful")

        print("\n🎉 All imports successful! Backend is ready to run.")
        return True

    except Exception as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_basic_functionality():
    """Test basic functionality without API calls"""
    try:
        print("\nTesting basic functionality...")

        # Test FileProcessingService
        file_service = FileProcessingService()
        print("✅ FileProcessingService initialized")

        # Test ReplicateService (without API token)
        try:
            replicate_service = ReplicateService()
        except ValueError as e:
            if "REPLICATE_API_TOKEN" in str(e):
                print("✅ ReplicateService correctly requires API token")
            else:
                raise e

        print("✅ Basic functionality tests passed")
        return True

    except Exception as e:
        print(f"❌ Functionality test error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Remberify Backend")
    print("=" * 50)

    imports_ok = test_imports()
    functionality_ok = test_basic_functionality()

    print("\n" + "=" * 50)
    if imports_ok and functionality_ok:
        print("🎉 Backend setup is complete and ready to run!")
        print("\nTo start the server:")
        print("1. Set REPLICATE_API_TOKEN environment variable")
        print("2. Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("❌ Backend has issues that need to be resolved")
