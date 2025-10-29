from sqlalchemy import Column, Integer, DECIMAL, String, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base


class UserPantry(Base):
    __tablename__ = "user_pantry"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredient.id", ondelete="CASCADE"), primary_key=True)
    quantity = Column(DECIMAL(10, 2), nullable=False)
    unit = Column(String(32), nullable=True)

    # Relationships
    user = relationship("User", back_populates="user_pantries")
    ingredient = relationship("Ingredient", back_populates="user_pantries")