from typing import List, Optional
from sqlalchemy.orm import Session
from ..repositories.recipe_repository import RecipeRepository
from ..schemas.recipe import Recipe, RecipeCreate, RecipeUpdate


class RecipeService:
    def __init__(self, db: Session):
        self.repository = RecipeRepository(db)

    def get_all_recipes(self, skip: int = 0, limit: int = 100) -> List[Recipe]:
        recipes = self.repository.get_all(skip, limit)
        return [self._format_recipe(recipe) for recipe in recipes]

    def get_recipe_by_id(self, recipe_id: int) -> Optional[Recipe]:
        recipe = self.repository.get_by_id(recipe_id)
        return self._format_recipe(recipe) if recipe else None

    def get_recipes_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[Recipe]:
        recipes = self.repository.get_by_category(category, skip, limit)
        return [self._format_recipe(recipe) for recipe in recipes]

    def search_recipes(self, name: str, skip: int = 0, limit: int = 100) -> List[Recipe]:
        recipes = self.repository.search_by_name(name, skip, limit)
        return [self._format_recipe(recipe) for recipe in recipes]

    def create_recipe(self, recipe_data: RecipeCreate) -> Recipe:
        recipe = self.repository.create(recipe_data)
        return self._format_recipe(recipe)

    def update_recipe(self, recipe_id: int, recipe_data: RecipeUpdate) -> Optional[Recipe]:
        recipe = self.repository.update(recipe_id, recipe_data)
        return self._format_recipe(recipe) if recipe else None

    def delete_recipe(self, recipe_id: int) -> bool:
        return self.repository.delete(recipe_id)

    def get_recipes_by_ingredients(self, ingredient_ids: List[int], skip: int = 0, limit: int = 50):
        """Find recipes that can be made with the given ingredients"""
        # For now, return a simple implementation that finds recipes containing any of the ingredients
        # In a real implementation, you'd want more sophisticated matching logic
        
        from ..models.recipe import Recipe as RecipeModel
        from ..models.recipe_ingredient import RecipeIngredient
        from sqlalchemy import distinct
        
        # Get recipes that contain any of the specified ingredients
        recipes_query = (
            self.repository.db.query(RecipeModel)
            .join(RecipeIngredient)
            .filter(RecipeIngredient.ingredient_id.in_(ingredient_ids))
            .distinct()
            .offset(skip)
            .limit(limit)
        )
        
        recipes = recipes_query.all()
        
        # Calculate match percentages and format results
        results = []
        for recipe in recipes:
            # Get all ingredient IDs for this recipe
            recipe_ingredient_ids = [ri.ingredient_id for ri in recipe.recipe_ingredients]
            
            # Calculate match percentage
            matching_ingredients = set(ingredient_ids) & set(recipe_ingredient_ids)
            match_percentage = (len(matching_ingredients) / len(recipe_ingredient_ids)) * 100
            
            # Get ingredient names for available and missing ingredients
            available_ingredients = []
            missing_ingredients = []
            
            for ri in recipe.recipe_ingredients:
                ingredient_name = ri.ingredient.name if ri.ingredient else f"Ingredient {ri.ingredient_id}"
                if ri.ingredient_id in ingredient_ids:
                    available_ingredients.append(ingredient_name)
                else:
                    missing_ingredients.append(ingredient_name)
            
            results.append({
                "recipe": self._format_recipe(recipe),
                "match_percentage": round(match_percentage, 1),
                "available_ingredients": available_ingredients,
                "missing_ingredients": missing_ingredients
            })
        
        # Sort by match percentage (highest first)
        results.sort(key=lambda x: x["match_percentage"], reverse=True)
        
        return results

    def _format_recipe(self, recipe) -> Recipe:
        """Format recipe with ingredient names and sorted steps"""
        ingredients = []
        for ri in recipe.recipe_ingredients:
            ingredients.append({
                "recipe_id": ri.recipe_id,
                "ingredient_id": ri.ingredient_id,
                "quantity": ri.quantity,
                "unit": ri.unit,
                "ingredient_name": ri.ingredient.name if ri.ingredient else None
            })

        steps = sorted(recipe.recipe_steps, key=lambda x: x.step_order)

        return Recipe(
            id=recipe.id,
            name=recipe.name,
            category=recipe.category,
            cook_time_in_minutes=recipe.cook_time_in_minutes,
            prep_time_in_minutes=recipe.prep_time_in_minutes,
            ingredients=ingredients,
            steps=steps
        )