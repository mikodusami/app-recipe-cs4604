from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class UserPantryBase(BaseModel):
    ingredient_id: int
    quantity: Decimal
    unit: Optional[str] = None


class UserPantryCreate(UserPantryBase):
    pass


class UserPantryUpdate(BaseModel):
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None


class UserPantry(UserPantryBase):
    user_id: int
    ingredient_name: Optional[str] = None

    class Config:
        from_attributes = True