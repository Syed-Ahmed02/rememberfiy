#!/usr/bin/env python3
"""
Simple test script to check if the async issue is resolved
Run this after starting the backend server
"""

import requests
import json
import os
from pathlib import Path

def test_simple_upload():
    """Test a simple text upload to verify the server is working"""

    base_url = "http://localhost:8000"

    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/health")
        print("✅ Server Status:"        print(f"   {response.json()}")
        print()
    except Exception as e:
        print(f"❌ Server not running: {e}")
        print("   Start the server first: python main.py")
        return

    # Test 2: Test text upload (should work without async issues)
    print("📝 Testing Text Upload")
    print("=" * 30)

    text_data = {
        "content": "This is a test to verify that the async issue is resolved. The server should handle this request without any event loop conflicts using asyncio.run_in_executor.",
        "file_name": "test.txt"
    }

    try:
        response = requests.post(
            f"{base_url}/api/upload_text",
            json=text_data,
            headers={'Content-Type': 'application/json'}
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Text upload successful!")
            print(f"   File Type: {result.get('file_type')}")
            print(f"   Content Length: {len(result.get('content', ''))} characters")
            print(f"   Summary: {result.get('summary', 'N/A')[:100]}...")
            print()
            print("🎉 Async issue should now be resolved with proper thread pool handling!")
        else:
            print(f"❌ Text upload failed: {response.status_code}")
            print(f"   Error: {response.text}")

    except Exception as e:
        print(f"❌ Text upload request failed: {e}")
        print("   This might still be an async issue")

    print()
    print("🔍 Troubleshooting Tips:")
    print("   1. Make sure your REPLICATE_API_TOKEN is set in .env")
    print("   2. Try restarting the server: python main.py")
    print("   3. Check server logs for any remaining async errors")
    print("   4. The async issue should now be resolved using asyncio.run_in_executor()")
    print("   5. GLM-4V-9B OCR now runs in a thread pool to avoid event loop conflicts")

if __name__ == "__main__":
    test_simple_upload()
