from sqlalchemy.orm import Session
from typing import Optional, List
from passlib.context import CryptContext
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, UserResponse, UserProfile
from ..repositories.user_repository import UserRepository


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def _hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        return self.pwd_context.hash(password)

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user with validation and password hashing"""
        # Check if user already exists
        if self.user_repo.user_exists(user_data.email):
            raise ValueError("User with this email already exists")
        
        # Hash the password
        hashed_password = self._hash_password(user_data.password)
        
        # Create user
        db_user = self.user_repo.create_user(user_data, hashed_password)
        return UserResponse.model_validate(db_user)

    async def get_user_by_id(self, user_id: int) -> Optional[UserResponse]:
        """Get user by ID"""
        db_user = self.user_repo.get_user_by_id(user_id)
        if db_user:
            return UserResponse.model_validate(db_user)
        return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email (returns model for authentication)"""
        return self.user_repo.get_user_by_email(email)

    async def get_user_profile(self, user_id: int) -> Optional[UserProfile]:
        """Get user profile information"""
        db_user = self.user_repo.get_user_by_id(user_id)
        if db_user:
            return UserProfile.model_validate(db_user)
        return None

    async def update_user_profile(self, user_id: int, user_data: UserUpdate) -> Optional[UserResponse]:
        """Update user profile"""
        # If password is being updated, hash it
        if user_data.password:
            user_data.password = self._hash_password(user_data.password)
        
        db_user = self.user_repo.update_user(user_id, user_data)
        if db_user:
            return UserResponse.model_validate(db_user)
        return None

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        db_user = await self.get_user_by_email(email)
        if not db_user:
            return None
        
        if not self._verify_password(password, db_user.hashed_password):
            return None
        
        return db_user

    async def delete_user(self, user_id: int) -> bool:
        """Delete user"""
        return self.user_repo.delete_user(user_id)

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get list of users (admin functionality)"""
        db_users = self.user_repo.get_users(skip, limit)
        return [UserResponse.model_validate(user) for user in db_users]