from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal


class RecipeStepBase(BaseModel):
    step_order: int
    instruction: str
    time_in_minutes: Optional[int] = None


class RecipeStepCreate(RecipeStepBase):
    pass


class RecipeStep(RecipeStepBase):
    recipe_id: int

    class Config:
        from_attributes = True


class RecipeIngredientBase(BaseModel):
    ingredient_id: int
    quantity: Decimal
    unit: Optional[str] = None


class RecipeIngredientCreate(RecipeIngredientBase):
    pass


class RecipeIngredient(RecipeIngredientBase):
    recipe_id: int
    ingredient_name: Optional[str] = None

    class Config:
        from_attributes = True


class RecipeBase(BaseModel):
    name: str
    category: Optional[str] = None
    cook_time_in_minutes: Optional[int] = None
    prep_time_in_minutes: Optional[int] = None


class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientCreate] = []
    steps: List[RecipeStepCreate] = []


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    cook_time_in_minutes: Optional[int] = None
    prep_time_in_minutes: Optional[int] = None


class Recipe(RecipeBase):
    id: int
    ingredients: List[RecipeIngredient] = []
    steps: List[RecipeStep] = []

    class Config:
        from_attributes = True