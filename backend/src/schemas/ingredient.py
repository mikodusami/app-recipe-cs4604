from pydantic import BaseModel
from typing import List, Optional


class IngredientSubstituteBase(BaseModel):
    name: str
    unit: Optional[str] = None
    category: Optional[str] = None


class IngredientSubstituteCreate(IngredientSubstituteBase):
    pass


class IngredientSubstitute(IngredientSubstituteBase):
    source_ingredient_id: int

    class Config:
        from_attributes = True


class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None


class Ingredient(IngredientBase):
    id: int
    substitutes: List[IngredientSubstitute] = []

    class Config:
        from_attributes = True