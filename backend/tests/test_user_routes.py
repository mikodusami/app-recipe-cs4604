import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException
from src.routers.users import router, get_user_service
from src.schemas.user import UserResponse, UserProfile
from src.models.user import UserRole
from datetime import datetime


# Create a test app with just the user router
from fastapi import FastAPI
test_app = FastAPI()
test_app.include_router(router)


@pytest.fixture
def mock_user_service():
    """Create a mock user service"""
    return AsyncMock()


@pytest.fixture
def client(mock_user_service):
    """Create test client with mocked dependencies"""
    test_app.dependency_overrides[get_user_service] = lambda: mock_user_service
    with TestClient(test_app) as test_client:
        yield test_client
    test_app.dependency_overrides.clear()


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "standard"
    }


class TestUserRoutes:
    def test_register_user(self, client, mock_user_service, sample_user_data):
        """Test user registration endpoint"""
        # Mock the service response
        mock_response = UserResponse(
            id=1,
            email=sample_user_data["email"],
            role=UserRole.standard,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_user_service.create_user.return_value = mock_response
        
        response = client.post("/users/register", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == sample_user_data["email"]
        assert data["role"] == sample_user_data["role"]
        assert "id" in data

    def test_register_user_duplicate_email(self, client, mock_user_service, sample_user_data):
        """Test registering user with duplicate email"""
        # Mock service to raise ValueError
        mock_user_service.create_user.side_effect = ValueError("User with this email already exists")
        
        response = client.post("/users/register", json=sample_user_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_register_user_invalid_email(self, client, mock_user_service):
        """Test registering user with invalid email"""
        invalid_data = {
            "email": "invalid-email",
            "password": "testpassword123",
            "role": "standard"
        }
        
        response = client.post("/users/register", json=invalid_data)
        assert response.status_code == 422

    def test_get_user_profile(self, client, mock_user_service):
        """Test getting user profile"""
        # Mock the service response
        mock_profile = UserProfile(
            id=1,
            email="test@example.com",
            role=UserRole.standard,
            created_at=datetime.now()
        )
        mock_user_service.get_user_profile.return_value = mock_profile
        
        response = client.get("/users/profile/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["id"] == 1

    def test_get_user_profile_not_found(self, client, mock_user_service):
        """Test getting non-existent user profile"""
        mock_user_service.get_user_profile.return_value = None
        
        response = client.get("/users/profile/999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    def test_update_user_profile(self, client, mock_user_service):
        """Test updating user profile"""
        # Mock the service response
        mock_response = UserResponse(
            id=1,
            email="updated@example.com",
            role=UserRole.admin,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_user_service.update_user_profile.return_value = mock_response
        
        update_data = {
            "email": "updated@example.com",
            "role": "admin"
        }
        response = client.put("/users/profile/1", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "updated@example.com"
        assert data["role"] == "admin"

    def test_update_user_profile_not_found(self, client, mock_user_service):
        """Test updating non-existent user profile"""
        mock_user_service.update_user_profile.return_value = None
        
        update_data = {"email": "updated@example.com"}
        response = client.put("/users/profile/999", json=update_data)
        
        assert response.status_code == 404

    def test_delete_user(self, client, mock_user_service):
        """Test deleting user"""
        mock_user_service.delete_user.return_value = True
        
        response = client.delete("/users/profile/1")
        
        assert response.status_code == 204

    def test_delete_user_not_found(self, client, mock_user_service):
        """Test deleting non-existent user"""
        mock_user_service.delete_user.return_value = False
        
        response = client.delete("/users/profile/999")
        
        assert response.status_code == 404

    def test_get_users_list(self, client, mock_user_service):
        """Test getting list of users"""
        # Mock service response
        mock_users = [
            UserResponse(
                id=i,
                email=f"user{i}@example.com",
                role=UserRole.standard,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            for i in range(3)
        ]
        mock_user_service.get_users.return_value = mock_users
        
        response = client.get("/users/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_get_user_by_id(self, client, mock_user_service):
        """Test getting user by ID"""
        # Mock service response
        mock_response = UserResponse(
            id=1,
            email="test@example.com",
            role=UserRole.standard,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_user_service.get_user_by_id.return_value = mock_response
        
        response = client.get("/users/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["id"] == 1

    def test_get_user_by_id_not_found(self, client, mock_user_service):
        """Test getting non-existent user by ID"""
        mock_user_service.get_user_by_id.return_value = None
        
        response = client.get("/users/999")
        
        assert response.status_code == 404