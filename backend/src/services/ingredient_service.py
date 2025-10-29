from typing import List, Optional
from sqlalchemy.orm import Session
from ..repositories.ingredient_repository import IngredientRepository
from ..schemas.ingredient import Ingredient, IngredientCreate, IngredientUpdate, IngredientSubstitute


class IngredientService:
    def __init__(self, db: Session):
        self.repository = IngredientRepository(db)

    def get_all_ingredients(self, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        return self.repository.get_all(skip, limit)

    def get_ingredient_by_id(self, ingredient_id: int) -> Optional[Ingredient]:
        return self.repository.get_by_id(ingredient_id)

    def get_ingredient_by_name(self, name: str) -> Optional[Ingredient]:
        return self.repository.get_by_name(name)

    def get_ingredients_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        return self.repository.get_by_category(category, skip, limit)

    def search_ingredients(self, name: str, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        return self.repository.search_by_name(name, skip, limit)

    def create_ingredient(self, ingredient_data: IngredientCreate) -> Ingredient:
        return self.repository.create(ingredient_data)

    def update_ingredient(self, ingredient_id: int, ingredient_data: IngredientUpdate) -> Optional[Ingredient]:
        return self.repository.update(ingredient_id, ingredient_data)

    def delete_ingredient(self, ingredient_id: int) -> bool:
        return self.repository.delete(ingredient_id)

    def add_substitute(self, ingredient_id: int, substitute_name: str, unit: Optional[str] = None, category: Optional[str] = None) -> Optional[IngredientSubstitute]:
        return self.repository.add_substitute(ingredient_id, substitute_name, unit, category)

    def get_unique_categories(self) -> List[str]:
        """Get all unique ingredient categories"""
        ingredients = self.repository.get_all(skip=0, limit=1000)  # Get all for categories
        categories = set()
        for ingredient in ingredients:
            if ingredient.category:
                categories.add(ingredient.category)
        return sorted(list(categories))