from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from ..core.database import Base


class DifficultyLevel(PyEnum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    instructions = Column(Text, nullable=False)
    cooking_time_minutes = Column(Integer, nullable=False)
    difficulty_level = Column(Enum(DifficultyLevel), default=DifficultyLevel.medium, nullable=False)
    servings = Column(Integer, nullable=False)
    cuisine_type = Column(String, index=True)
    dietary_tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    recipe_ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    favorited_by = relationship("FavoriteRecipe", back_populates="recipe", cascade="all, delete-orphan")