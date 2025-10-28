from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class FavoriteRecipe(Base):
    __tablename__ = "favorite_recipe"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipe.id", ondelete="CASCADE"), primary_key=True)
    user_note = Column(String(500), nullable=True)
    favorited_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorite_recipes")
    recipe = relationship("Recipe", back_populates="favorite_recipes")