from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..models.user_pantry import UserPantry
from ..models.ingredient import Ingredient
from ..schemas.user_pantry import UserPantryCreate, UserPantryUpdate


class UserPantryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_pantry(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserPantry]:
        return (
            self.db.query(UserPantry)
            .options(joinedload(UserPantry.ingredient))
            .filter(UserPantry.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_user_and_ingredient(self, user_id: int, ingredient_id: int) -> Optional[UserPantry]:
        return (
            self.db.query(UserPantry)
            .options(joinedload(UserPantry.ingredient))
            .filter(UserPantry.user_id == user_id, UserPantry.ingredient_id == ingredient_id)
            .first()
        )

    def create(self, user_id: int, pantry_data: UserPantryCreate) -> UserPantry:
        db_pantry = UserPantry(
            user_id=user_id,
            ingredient_id=pantry_data.ingredient_id,
            quantity=pantry_data.quantity,
            unit=pantry_data.unit
        )
        self.db.add(db_pantry)
        self.db.commit()
        self.db.refresh(db_pantry)
        return db_pantry

    def update(self, user_id: int, ingredient_id: int, pantry_data: UserPantryUpdate) -> Optional[UserPantry]:
        db_pantry = self.get_by_user_and_ingredient(user_id, ingredient_id)
        if not db_pantry:
            return None

        update_data = pantry_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_pantry, field, value)

        self.db.commit()
        self.db.refresh(db_pantry)
        return db_pantry

    def delete(self, user_id: int, ingredient_id: int) -> bool:
        db_pantry = self.get_by_user_and_ingredient(user_id, ingredient_id)
        if not db_pantry:
            return False

        self.db.delete(db_pantry)
        self.db.commit()
        return True

    def get_pantry_by_category(self, user_id: int, category: str, skip: int = 0, limit: int = 100) -> List[UserPantry]:
        return (
            self.db.query(UserPantry)
            .join(Ingredient)
            .options(joinedload(UserPantry.ingredient))
            .filter(UserPantry.user_id == user_id, Ingredient.category == category)
            .offset(skip)
            .limit(limit)
            .all()
        )