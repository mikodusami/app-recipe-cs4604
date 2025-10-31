from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..repositories.favorite_recipe_repository import FavoriteRecipeRepository
from ..schemas.favorite_recipe import FavoriteRecipe, FavoriteRecipeCreate, FavoriteRecipeUpdate


class FavoriteRecipeService:
    def __init__(self, db: Session):
        self.repository = FavoriteRecipeRepository(db)
        self.db = db

    def get_user_favorites(self, user_id: int, skip: int = 0, limit: int = 100) -> List[FavoriteRecipe]:
        """ORM version"""
        #favorites = self.repository.get_user_favorites(user_id, skip, limit)
        #return [self._format_favorite(favorite) for favorite in favorites]
        
        """raw SQL version """
        query = text("""
        SELECT 
        F.user_id, F.recipe_id, F.user_note, F.favorited_at, R.name AS recipe_name
        FROM favorite_recipe F
        LEFT JOIN recipe R ON F.recipe_id = R.id
        WHERE user_id = :user_id 
        LIMIT :limit OFFSET :skip 
        """)
        result = self.db.execute(query, {'user_id': user_id, 'limit': limit, 'skip': skip})
        favorites = [self._format_favorite_sql(favorite) for favorite in result.fetchall()]
        return favorites

    def get_favorite(self, user_id: int, recipe_id: int) -> Optional[FavoriteRecipe]:
        #favorite = self.repository.get_by_user_and_recipe(user_id, recipe_id)
        #return self._format_favorite(favorite) if favorite else None
        
        query = text("""
        SELECT 
        F.user_id, F.recipe_id, F.user_note, F.favorited_at, R.name AS recipe_name
        FROM favorite_recipe F
        LEFT JOIN recipe R ON F.recipe_id = R.id
        WHERE user_id = :user_id AND recipe_id = :recipe_id 
        """)
        result = self.db.execute(query, {'user_id': user_id, 'recipe_id': recipe_id})
        favorite = [self._format_favorite_sql(favorite) for favorite in result.fetchall()]
        return favorite

    def add_favorite(self, user_id: int, favorite_data: FavoriteRecipeCreate) -> FavoriteRecipe:
        #favorite = self.repository.create(user_id, favorite_data)
        #return self._format_favorite(favorite)
        
        query = text("""
        INSERT INTO favorite_recipe (user_id, recipe_id, user_note, favorited_at)
        VALUES (:user_id, :recipe_id, :user_note,  CURRENT_TIMESTAMP)
        RETURNING user_id, recipe_id, user_note, favorited_at
        """)
        
        result = self.db.execute(query,{'user_id': user_id, 'recipe_id': favorite_data.recipe_id, "user_note":favorite_data.user_note if favorite_data.user_note else None})
        favorite_row = result.fetchone()
        self.db.commit()
        
        favorite = self._format_favorite_sql(favorite_row)
        return favorite

    def update_favorite(self, user_id: int, recipe_id: int, favorite_data: FavoriteRecipeUpdate) -> Optional[FavoriteRecipe]:
        #favorite = self.repository.update(user_id, recipe_id, favorite_data)
        #return self._format_favorite(favorite) if favorite else None
        
        query = text("""
        UPDATE  favorite_recipe 
        SET user_note =  :usernote, favorited_at = CURRENT_TIMESTAMP
        WHERE user_id = :user_id AND recipe_id = :recipe_id
        RETURNING user_id, recipe_id, user_note, favorited_at
        """)
        
        result = self.db.execute(query,{'user_id': user_id, 'recipe_id': recipe_id, "user_note":favorite_data.user_note if favorite_data.user_note else None})
        favorite_row = result.fetchone()
        self.db.commit()
        
        favorite = self._format_favorite_sql(favorite_row)
        return favorite

    def remove_favorite(self, user_id: int, recipe_id: int) -> bool:
        #return self.repository.delete(user_id, recipe_id)
        
        query = text("""
        DELETE FROM favorite_recipe 
        WHERE user_id = :user_id AND recipe_id = :recipe_id
        """)
        
        result = self.db.execute(query,{'user_id': user_id, 'recipe_id': recipe_id, })
        self.db.commit()
        
        return result.rowcount > 0

    def is_favorited(self, user_id: int, recipe_id: int) -> bool:
        #return self.repository.is_favorited(user_id, recipe_id)
        
        query = text("""
        SELECT * FROM favorite_recipe
        WHERE user_id = :user_id AND recipe_id = :recipe_id
        """
        )
        
        result = self.db.execute(query, {"user_id": user_id, "recipe_id": recipe_id})
        return result.fetchone() is not None
        

    def _format_favorite(self, favorite) -> FavoriteRecipe:
        """Format favorite with recipe name"""
        return FavoriteRecipe(
            user_id=favorite.user_id,
            recipe_id=favorite.recipe_id,
            user_note=favorite.user_note,
            favorited_at=favorite.favorited_at,
            recipe_name=favorite.recipe.name if favorite.recipe else None
        )
    def _format_favorite_sql(self, favorite) -> FavoriteRecipe:
        
         return FavoriteRecipe(
            user_id=favorite.user_id,
            recipe_id=favorite.recipe_id,
            user_note=favorite.user_note,
            favorited_at=favorite.favorited_at,
            recipe_name = getattr(favorite, "recipe_name", None)
        )