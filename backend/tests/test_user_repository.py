import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.database import Base
from src.models.user import User, UserRole
from src.repositories.user_repository import UserRepository
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
def user_repository(db_session):
    """Create a user repository instance"""
    return UserRepository(db_session)


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return UserCreate(
        email="test@example.com",
        password="testpassword123",
        role=UserRole.standard
    )


class TestUserRepository:
    def test_create_user(self, user_repository, sample_user_data):
        """Test creating a new user"""
        hashed_password = "hashed_password_123"
        user = user_repository.create_user(sample_user_data, hashed_password)
        
        assert user.id is not None
        assert user.email == sample_user_data.email
        assert user.hashed_password == hashed_password
        assert user.role == sample_user_data.role
        assert user.created_at is not None

    def test_create_user_duplicate_email(self, user_repository, sample_user_data):
        """Test creating user with duplicate email raises error"""
        hashed_password = "hashed_password_123"
        user_repository.create_user(sample_user_data, hashed_password)
        
        with pytest.raises(ValueError, match="User with this email already exists"):
            user_repository.create_user(sample_user_data, hashed_password)

    def test_get_user_by_id(self, user_repository, sample_user_data):
        """Test getting user by ID"""
        hashed_password = "hashed_password_123"
        created_user = user_repository.create_user(sample_user_data, hashed_password)
        
        retrieved_user = user_repository.get_user_by_id(created_user.id)
        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.email == sample_user_data.email

    def test_get_user_by_id_not_found(self, user_repository):
        """Test getting non-existent user returns None"""
        user = user_repository.get_user_by_id(999)
        assert user is None

    def test_get_user_by_email(self, user_repository, sample_user_data):
        """Test getting user by email"""
        hashed_password = "hashed_password_123"
        user_repository.create_user(sample_user_data, hashed_password)
        
        retrieved_user = user_repository.get_user_by_email(sample_user_data.email)
        assert retrieved_user is not None
        assert retrieved_user.email == sample_user_data.email

    def test_get_user_by_email_not_found(self, user_repository):
        """Test getting non-existent user by email returns None"""
        user = user_repository.get_user_by_email("nonexistent@example.com")
        assert user is None

    def test_update_user(self, user_repository, sample_user_data):
        """Test updating user information"""
        hashed_password = "hashed_password_123"
        created_user = user_repository.create_user(sample_user_data, hashed_password)
        
        update_data = UserUpdate(email="updated@example.com", role=UserRole.admin)
        updated_user = user_repository.update_user(created_user.id, update_data)
        
        assert updated_user is not None
        assert updated_user.email == "updated@example.com"
        assert updated_user.role == UserRole.admin

    def test_update_user_not_found(self, user_repository):
        """Test updating non-existent user returns None"""
        update_data = UserUpdate(email="updated@example.com")
        result = user_repository.update_user(999, update_data)
        assert result is None

    def test_delete_user(self, user_repository, sample_user_data):
        """Test deleting user"""
        hashed_password = "hashed_password_123"
        created_user = user_repository.create_user(sample_user_data, hashed_password)
        
        success = user_repository.delete_user(created_user.id)
        assert success is True
        
        # Verify user is deleted
        deleted_user = user_repository.get_user_by_id(created_user.id)
        assert deleted_user is None

    def test_delete_user_not_found(self, user_repository):
        """Test deleting non-existent user returns False"""
        success = user_repository.delete_user(999)
        assert success is False

    def test_user_exists(self, user_repository, sample_user_data):
        """Test checking if user exists"""
        assert user_repository.user_exists(sample_user_data.email) is False
        
        hashed_password = "hashed_password_123"
        user_repository.create_user(sample_user_data, hashed_password)
        
        assert user_repository.user_exists(sample_user_data.email) is True

    def test_get_users_pagination(self, user_repository):
        """Test getting users with pagination"""
        # Create multiple users
        for i in range(5):
            user_data = UserCreate(
                email=f"user{i}@example.com",
                password="password123",
                role=UserRole.standard
            )
            user_repository.create_user(user_data, f"hashed_password_{i}")
        
        # Test pagination
        users_page1 = user_repository.get_users(skip=0, limit=3)
        assert len(users_page1) == 3
        
        users_page2 = user_repository.get_users(skip=3, limit=3)
        assert len(users_page2) == 2