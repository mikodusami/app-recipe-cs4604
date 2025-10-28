from typing import List, Optional
from sqlalchemy.orm import Session
from ..repositories.favorite_recipe_repository import FavoriteRecipeRepository
from ..schemas.favorite_recipe import FavoriteRecipe, FavoriteRecipeCreate, FavoriteRecipeUpdate


class FavoriteRecipeService:
    def __init__(self, db: Session):
        self.repository = FavoriteRecipeRepository(db)

    def get_user_favorites(self, user_id: int, skip: int = 0, limit: int = 100) -> List[FavoriteRecipe]:
        favorites = self.repository.get_user_favorites(user_id, skip, limit)
        return [self._format_favorite(favorite) for favorite in favorites]

    def get_favorite(self, user_id: int, recipe_id: int) -> Optional[FavoriteRecipe]:
        favorite = self.repository.get_by_user_and_recipe(user_id, recipe_id)
        return self._format_favorite(favorite) if favorite else None

    def add_favorite(self, user_id: int, favorite_data: FavoriteRecipeCreate) -> FavoriteRecipe:
        favorite = self.repository.create(user_id, favorite_data)
        return self._format_favorite(favorite)

    def update_favorite(self, user_id: int, recipe_id: int, favorite_data: FavoriteRecipeUpdate) -> Optional[FavoriteRecipe]:
        favorite = self.repository.update(user_id, recipe_id, favorite_data)
        return self._format_favorite(favorite) if favorite else None

    def remove_favorite(self, user_id: int, recipe_id: int) -> bool:
        return self.repository.delete(user_id, recipe_id)

    def is_favorited(self, user_id: int, recipe_id: int) -> bool:
        return self.repository.is_favorited(user_id, recipe_id)

    def _format_favorite(self, favorite) -> FavoriteRecipe:
        """Format favorite with recipe name"""
        return FavoriteRecipe(
            user_id=favorite.user_id,
            recipe_id=favorite.recipe_id,
            user_note=favorite.user_note,
            favorited_at=favorite.favorited_at,
            recipe_name=favorite.recipe.name if favorite.recipe else None
        )