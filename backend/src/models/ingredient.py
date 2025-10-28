from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base


class Ingredient(Base):
    __tablename__ = "ingredient"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False, unique=True)
    category = Column(String(64), nullable=True)

    # Relationships
    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient", cascade="all, delete-orphan")
    user_pantries = relationship("UserPantry", back_populates="ingredient", cascade="all, delete-orphan")
    substitutes = relationship("IngredientSubstitute", back_populates="source_ingredient", cascade="all, delete-orphan")


class IngredientSubstitute(Base):
    __tablename__ = "ingredient_substitute"

    source_ingredient_id = Column(Integer, ForeignKey("ingredient.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(128), primary_key=True)
    unit = Column(String(32), nullable=True)
    category = Column(String(64), nullable=True)

    # Relationships
    source_ingredient = relationship("Ingredient", back_populates="substitutes")