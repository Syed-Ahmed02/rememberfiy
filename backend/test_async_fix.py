import requests
import json
import os

def test_async_fix():
    """Test that the async issue is resolved"""
    base_url = "http://localhost:8000"

    print("🧪 Testing Async Fix")
    print("=" * 30)

    # Check if server is running
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code != 200:
            print("❌ Server not responding properly")
            return
        print("✅ Server Status:")
        print(f"   {response.json()}")
        print()
    except Exception as e:
        print(f"❌ Server not running: {e}")
        print("   Start the server first: python main.py")
        return

    # Test text upload (should work without async issues)
    print("📝 Testing Text Upload")
    text_data = {
        "content": "This is a test to verify that the async issue is resolved. The server should handle this request without any event loop conflicts using replicate.async_run().",
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
            print(f"   Content Length: {len(result.get('content', ''))} characters")
            print(f"   Summary: {result.get('summary', 'N/A')[:100]}...")
        else:
            print(f"❌ Text upload failed: {response.status_code}")
            print(f"   Error: {response.text}")

    except Exception as e:
        print(f"❌ Text upload request failed: {e}")

if __name__ == "__main__":
    test_async_fix()
