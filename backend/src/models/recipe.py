from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Recipe(Base):
    __tablename__ = "recipe"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(64), nullable=True)
    cook_time_in_minutes = Column(Integer, nullable=True)
    prep_time_in_minutes = Column(Integer, nullable=True)

    # Relationships
    recipe_ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    recipe_steps = relationship("RecipeStep", back_populates="recipe", cascade="all, delete-orphan")
    favorite_recipes = relationship("FavoriteRecipe", back_populates="recipe", cascade="all, delete-orphan")


class RecipeStep(Base):
    __tablename__ = "recipe_step"

    recipe_id = Column(Integer, ForeignKey("recipe.id", ondelete="CASCADE"), primary_key=True)
    step_order = Column(Integer, primary_key=True)
    instruction = Column(Text, nullable=False)
    time_in_minutes = Column(Integer, nullable=True)

    # Relationships
    recipe = relationship("Recipe", back_populates="recipe_steps")