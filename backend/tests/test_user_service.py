import pytest
from unittest.mock import Mock, AsyncMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.database import Base
from src.models.user import User, UserRole
from src.services.user_service import UserService
from src.schemas.user import UserCreate, UserUpdate


# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def user_service(db_session):
    """Create a user service instance"""
    return UserService(db_session)


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return UserCreate(
        email="test@example.com",
        password="testpassword123",
        role=UserRole.standard
    )


class TestUserService:
    @pytest.mark.asyncio
    async def test_create_user(self, user_service, sample_user_data):
        """Test creating a new user"""
        user_response = await user_service.create_user(sample_user_data)
        
        assert user_response.email == sample_user_data.email
        assert user_response.role == sample_user_data.role
        assert user_response.id is not None
        assert user_response.created_at is not None

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self, user_service, sample_user_data):
        """Test creating user with duplicate email raises error"""
        await user_service.create_user(sample_user_data)
        
        with pytest.raises(ValueError, match="User with this email already exists"):
            await user_service.create_user(sample_user_data)

    @pytest.mark.asyncio
    async def test_get_user_by_id(self, user_service, sample_user_data):
        """Test getting user by ID"""
        created_user = await user_service.create_user(sample_user_data)
        retrieved_user = await user_service.get_user_by_id(created_user.id)
        
        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.email == sample_user_data.email

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, user_service):
        """Test getting non-existent user returns None"""
        user = await user_service.get_user_by_id(999)
        assert user is None

    @pytest.mark.asyncio
    async def test_get_user_profile(self, user_service, sample_user_data):
        """Test getting user profile"""
        created_user = await user_service.create_user(sample_user_data)
        profile = await user_service.get_user_profile(created_user.id)
        
        assert profile is not None
        assert profile.id == created_user.id
        assert profile.email == sample_user_data.email
        assert profile.role == sample_user_data.role

    @pytest.mark.asyncio
    async def test_update_user_profile(self, user_service, sample_user_data):
        """Test updating user profile"""
        created_user = await user_service.create_user(sample_user_data)
        
        update_data = UserUpdate(email="updated@example.com", role=UserRole.admin)
        updated_user = await user_service.update_user_profile(created_user.id, update_data)
        
        assert updated_user is not None
        assert updated_user.email == "updated@example.com"
        assert updated_user.role == UserRole.admin

    @pytest.mark.asyncio
    async def test_update_user_profile_not_found(self, user_service):
        """Test updating non-existent user returns None"""
        update_data = UserUpdate(email="updated@example.com")
        result = await user_service.update_user_profile(999, update_data)
        assert result is None

    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, user_service, sample_user_data):
        """Test successful user authentication"""
        await user_service.create_user(sample_user_data)
        
        authenticated_user = await user_service.authenticate_user(
            sample_user_data.email, 
            sample_user_data.password
        )
        
        assert authenticated_user is not None
        assert authenticated_user.email == sample_user_data.email

    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self, user_service, sample_user_data):
        """Test authentication with wrong password"""
        await user_service.create_user(sample_user_data)
        
        authenticated_user = await user_service.authenticate_user(
            sample_user_data.email, 
            "wrongpassword"
        )
        
        assert authenticated_user is None

    @pytest.mark.asyncio
    async def test_authenticate_user_not_found(self, user_service):
        """Test authentication with non-existent user"""
        authenticated_user = await user_service.authenticate_user(
            "nonexistent@example.com", 
            "password"
        )
        
        assert authenticated_user is None

    @pytest.mark.asyncio
    async def test_delete_user(self, user_service, sample_user_data):
        """Test deleting user"""
        created_user = await user_service.create_user(sample_user_data)
        
        success = await user_service.delete_user(created_user.id)
        assert success is True
        
        # Verify user is deleted
        deleted_user = await user_service.get_user_by_id(created_user.id)
        assert deleted_user is None

    @pytest.mark.asyncio
    async def test_get_users(self, user_service):
        """Test getting list of users"""
        # Create multiple users
        for i in range(3):
            user_data = UserCreate(
                email=f"user{i}@example.com",
                password="password123",
                role=UserRole.standard
            )
            await user_service.create_user(user_data)
        
        users = await user_service.get_users()
        assert len(users) == 3

    def test_password_hashing(self, user_service):
        """Test password hashing and verification"""
        password = "testpassword123"
        hashed = user_service._hash_password(password)
        
        assert hashed != password
        assert user_service._verify_password(password, hashed) is True
        assert user_service._verify_password("wrongpassword", hashed) is False