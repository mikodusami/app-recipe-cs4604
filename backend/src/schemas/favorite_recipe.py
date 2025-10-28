from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FavoriteRecipeBase(BaseModel):
    user_note: Optional[str] = None


class FavoriteRecipeCreate(FavoriteRecipeBase):
    recipe_id: int


class FavoriteRecipeUpdate(BaseModel):
    user_note: Optional[str] = None


class FavoriteRecipe(FavoriteRecipeBase):
    user_id: int
    recipe_id: int
    favorited_at: datetime
    recipe_name: Optional[str] = None

    class Config:
        from_attributes = True