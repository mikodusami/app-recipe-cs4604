from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..models.recipe import Recipe, RecipeStep
from ..models.recipe_ingredient import RecipeIngredient
from ..models.ingredient import Ingredient
from ..schemas.recipe import RecipeCreate, RecipeUpdate


class RecipeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Recipe]:
        return (
            self.db.query(Recipe)
            .options(
                joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient),
                joinedload(Recipe.recipe_steps)
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, recipe_id: int) -> Optional[Recipe]:
        return (
            self.db.query(Recipe)
            .options(
                joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient),
                joinedload(Recipe.recipe_steps)
            )
            .filter(Recipe.id == recipe_id)
            .first()
        )

    def get_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[Recipe]:
        return (
            self.db.query(Recipe)
            .options(
                joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient),
                joinedload(Recipe.recipe_steps)
            )
            .filter(Recipe.category == category)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_by_name(self, name: str, skip: int = 0, limit: int = 100) -> List[Recipe]:
        return (
            self.db.query(Recipe)
            .options(
                joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient),
                joinedload(Recipe.recipe_steps)
            )
            .filter(Recipe.name.ilike(f"%{name}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, recipe_data: RecipeCreate) -> Recipe:
        # Create the recipe
        db_recipe = Recipe(
            name=recipe_data.name,
            category=recipe_data.category,
            cook_time_in_minutes=recipe_data.cook_time_in_minutes,
            prep_time_in_minutes=recipe_data.prep_time_in_minutes
        )
        self.db.add(db_recipe)
        self.db.flush()  # Get the ID

        # Add ingredients
        for ingredient_data in recipe_data.ingredients:
            db_recipe_ingredient = RecipeIngredient(
                recipe_id=db_recipe.id,
                ingredient_id=ingredient_data.ingredient_id,
                quantity=ingredient_data.quantity,
                unit=ingredient_data.unit
            )
            self.db.add(db_recipe_ingredient)

        # Add steps
        for step_data in recipe_data.steps:
            db_recipe_step = RecipeStep(
                recipe_id=db_recipe.id,
                step_order=step_data.step_order,
                instruction=step_data.instruction,
                time_in_minutes=step_data.time_in_minutes
            )
            self.db.add(db_recipe_step)

        self.db.commit()
        self.db.refresh(db_recipe)
        return db_recipe

    def update(self, recipe_id: int, recipe_data: RecipeUpdate) -> Optional[Recipe]:
        db_recipe = self.get_by_id(recipe_id)
        if not db_recipe:
            return None

        update_data = recipe_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_recipe, field, value)

        self.db.commit()
        self.db.refresh(db_recipe)
        return db_recipe

    def delete(self, recipe_id: int) -> bool:
        db_recipe = self.get_by_id(recipe_id)
        if not db_recipe:
            return False

        self.db.delete(db_recipe)
        self.db.commit()
        return True