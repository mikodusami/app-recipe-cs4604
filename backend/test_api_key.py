#!/usr/bin/env python3
"""
Simple script to test API key functionality
Run this after starting the FastAPI server with: fastapi dev main.py
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"
API_KEY = "dev"

def test_public_endpoints():
    """Test public endpoints that don't require API key"""
    print("Testing public endpoints...")
    
    # Test root endpoint
    response = requests.get(f"{BASE_URL}/")
    print(f"GET / - Status: {response.status_code}, Response: {response.json()}")
    
    # Test health endpoint
    response = requests.get(f"{BASE_URL}/health")
    print(f"GET /health - Status: {response.status_code}, Response: {response.json()}")

def test_protected_endpoints_without_key():
    """Test protected endpoints without API key (should fail)"""
    print("\nTesting protected endpoints without API key...")
    
    # Test protected endpoint
    response = requests.get(f"{BASE_URL}/protected")
    print(f"GET /protected (no key) - Status: {response.status_code}, Response: {response.json()}")
    
    # Test users endpoint
    response = requests.get(f"{BASE_URL}/users/")
    print(f"GET /users/ (no key) - Status: {response.status_code}, Response: {response.json()}")

def test_protected_endpoints_with_wrong_key():
    """Test protected endpoints with wrong API key (should fail)"""
    print("\nTesting protected endpoints with wrong API key...")
    
    headers = {"X-API-Key": "wrong_key"}
    
    # Test protected endpoint
    response = requests.get(f"{BASE_URL}/protected", headers=headers)
    print(f"GET /protected (wrong key) - Status: {response.status_code}, Response: {response.json()}")

def test_protected_endpoints_with_correct_key():
    """Test protected endpoints with correct API key (should succeed)"""
    print("\nTesting protected endpoints with correct API key...")
    
    headers = {"X-API-Key": API_KEY}
    
    # Test protected endpoint
    response = requests.get(f"{BASE_URL}/protected", headers=headers)
    print(f"GET /protected (correct key) - Status: {response.status_code}, Response: {response.json()}")
    
    # Test users endpoint
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    print(f"GET /users/ (correct key) - Status: {response.status_code}, Response: {response.json()}")

if __name__ == "__main__":
    print("API Key Authentication Test")
    print("=" * 40)
    
    try:
        test_public_endpoints()
        test_protected_endpoints_without_key()
        test_protected_endpoints_with_wrong_key()
        test_protected_endpoints_with_correct_key()
        
        print("\n" + "=" * 40)
        print("Test completed! Check the results above.")
        print(f"API Key for development: {API_KEY}")
        print("Visit http://127.0.0.1:8000/docs to test in Swagger UI")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server.")
        print("Make sure the FastAPI server is running with: fastapi dev main.py")
    except Exception as e:
        print(f"Error: {e}")