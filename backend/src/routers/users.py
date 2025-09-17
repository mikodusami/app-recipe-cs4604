from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..schemas.user import UserCreate, UserUpdate, UserResponse, UserProfile
from ..services.user_service import UserService


router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency to get user service"""
    return UserService(db)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Register a new user"""
    try:
        user = await user_service.create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Get user profile by ID"""
    user_profile = await user_service.get_user_profile(user_id)
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user_profile


@router.put("/profile/{user_id}", response_model=UserResponse)
async def update_user_profile(
    user_id: int,
    user_data: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """Update user profile"""
    try:
        updated_user = await user_service.update_user_profile(user_id, user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/profile/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Delete user"""
    success = await user_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service)
):
    """Get list of users (admin functionality)"""
    users = await user_service.get_users(skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Get user by ID"""
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user