from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from ..models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.standard


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True