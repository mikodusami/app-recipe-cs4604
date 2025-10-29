from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..models.favorite_recipe import FavoriteRecipe
from ..models.recipe import Recipe
from ..schemas.favorite_recipe import FavoriteRecipeCreate, FavoriteRecipeUpdate


class FavoriteRecipeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_favorites(self, user_id: int, skip: int = 0, limit: int = 100) -> List[FavoriteRecipe]:
        return (
            self.db.query(FavoriteRecipe)
            .options(joinedload(FavoriteRecipe.recipe))
            .filter(FavoriteRecipe.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_user_and_recipe(self, user_id: int, recipe_id: int) -> Optional[FavoriteRecipe]:
        return (
            self.db.query(FavoriteRecipe)
            .options(joinedload(FavoriteRecipe.recipe))
            .filter(FavoriteRecipe.user_id == user_id, FavoriteRecipe.recipe_id == recipe_id)
            .first()
        )

    def create(self, user_id: int, favorite_data: FavoriteRecipeCreate) -> FavoriteRecipe:
        db_favorite = FavoriteRecipe(
            user_id=user_id,
            recipe_id=favorite_data.recipe_id,
            user_note=favorite_data.user_note
        )
        self.db.add(db_favorite)
        self.db.commit()
        self.db.refresh(db_favorite)
        return db_favorite

    def update(self, user_id: int, recipe_id: int, favorite_data: FavoriteRecipeUpdate) -> Optional[FavoriteRecipe]:
        db_favorite = self.get_by_user_and_recipe(user_id, recipe_id)
        if not db_favorite:
            return None

        update_data = favorite_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_favorite, field, value)

        self.db.commit()
        self.db.refresh(db_favorite)
        return db_favorite

    def delete(self, user_id: int, recipe_id: int) -> bool:
        db_favorite = self.get_by_user_and_recipe(user_id, recipe_id)
        if not db_favorite:
            return False

        self.db.delete(db_favorite)
        self.db.commit()
        return True

    def is_favorited(self, user_id: int, recipe_id: int) -> bool:
        return self.get_by_user_and_recipe(user_id, recipe_id) is not None