from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from ..core.database import Base


class IngredientCategory(PyEnum):
    protein = "protein"
    vegetable = "vegetable"
    fruit = "fruit"
    grain = "grain"
    dairy = "dairy"
    spice = "spice"
    herb = "herb"
    oil = "oil"
    condiment = "condiment"
    other = "other"


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(Enum(IngredientCategory), default=IngredientCategory.other, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")