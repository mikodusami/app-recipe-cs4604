from typing import List, Optional
from sqlalchemy.orm import Session
from ..repositories.user_pantry_repository import UserPantryRepository
from ..schemas.user_pantry import UserPantry, UserPantryCreate, UserPantryUpdate


class UserPantryService:
    def __init__(self, db: Session):
        self.repository = UserPantryRepository(db)

    def get_user_pantry(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserPantry]:
        pantry_items = self.repository.get_user_pantry(user_id, skip, limit)
        return [self._format_pantry_item(item) for item in pantry_items]

    def get_pantry_item(self, user_id: int, ingredient_id: int) -> Optional[UserPantry]:
        item = self.repository.get_by_user_and_ingredient(user_id, ingredient_id)
        return self._format_pantry_item(item) if item else None

    def add_pantry_item(self, user_id: int, pantry_data: UserPantryCreate) -> UserPantry:
        item = self.repository.create(user_id, pantry_data)
        return self._format_pantry_item(item)

    def update_pantry_item(self, user_id: int, ingredient_id: int, pantry_data: UserPantryUpdate) -> Optional[UserPantry]:
        item = self.repository.update(user_id, ingredient_id, pantry_data)
        return self._format_pantry_item(item) if item else None

    def remove_pantry_item(self, user_id: int, ingredient_id: int) -> bool:
        return self.repository.delete(user_id, ingredient_id)

    def get_pantry_by_category(self, user_id: int, category: str, skip: int = 0, limit: int = 100) -> List[UserPantry]:
        pantry_items = self.repository.get_pantry_by_category(user_id, category, skip, limit)
        return [self._format_pantry_item(item) for item in pantry_items]

    def _format_pantry_item(self, item) -> UserPantry:
        """Format pantry item with ingredient name"""
        return UserPantry(
            user_id=item.user_id,
            ingredient_id=item.ingredient_id,
            quantity=item.quantity,
            unit=item.unit,
            ingredient_name=item.ingredient.name if item.ingredient else None
        )