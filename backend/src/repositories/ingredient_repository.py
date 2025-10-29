from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..models.ingredient import Ingredient, IngredientSubstitute
from ..schemas.ingredient import IngredientCreate, IngredientUpdate


class IngredientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        return (
            self.db.query(Ingredient)
            .options(joinedload(Ingredient.substitutes))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, ingredient_id: int) -> Optional[Ingredient]:
        return (
            self.db.query(Ingredient)
            .options(joinedload(Ingredient.substitutes))
            .filter(Ingredient.id == ingredient_id)
            .first()
        )

    def get_by_name(self, name: str) -> Optional[Ingredient]:
        return (
            self.db.query(Ingredient)
            .options(joinedload(Ingredient.substitutes))
            .filter(Ingredient.name == name)
            .first()
        )

    def get_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        return (
            self.db.query(Ingredient)
            .options(joinedload(Ingredient.substitutes))
            .filter(Ingredient.category == category)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_by_name(self, name: str, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        return (
            self.db.query(Ingredient)
            .options(joinedload(Ingredient.substitutes))
            .filter(Ingredient.name.ilike(f"%{name}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, ingredient_data: IngredientCreate) -> Ingredient:
        db_ingredient = Ingredient(
            name=ingredient_data.name,
            category=ingredient_data.category
        )
        self.db.add(db_ingredient)
        self.db.commit()
        self.db.refresh(db_ingredient)
        return db_ingredient

    def update(self, ingredient_id: int, ingredient_data: IngredientUpdate) -> Optional[Ingredient]:
        db_ingredient = self.get_by_id(ingredient_id)
        if not db_ingredient:
            return None

        update_data = ingredient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_ingredient, field, value)

        self.db.commit()
        self.db.refresh(db_ingredient)
        return db_ingredient

    def delete(self, ingredient_id: int) -> bool:
        db_ingredient = self.get_by_id(ingredient_id)
        if not db_ingredient:
            return False

        self.db.delete(db_ingredient)
        self.db.commit()
        return True

    def add_substitute(self, ingredient_id: int, substitute_name: str, unit: Optional[str] = None, category: Optional[str] = None) -> Optional[IngredientSubstitute]:
        # Check if ingredient exists
        ingredient = self.get_by_id(ingredient_id)
        if not ingredient:
            return None

        db_substitute = IngredientSubstitute(
            source_ingredient_id=ingredient_id,
            name=substitute_name,
            unit=unit,
            category=category
        )
        self.db.add(db_substitute)
        self.db.commit()
        self.db.refresh(db_substitute)
        return db_substitute