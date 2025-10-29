from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.dependencies import get_api_key
from ..services.favorite_recipe_service import FavoriteRecipeService
from ..schemas.favorite_recipe import FavoriteRecipe, FavoriteRecipeCreate, FavoriteRecipeUpdate

router = APIRouter(
    prefix="/users/{user_id}/favorites",
    tags=["favorites"],
    dependencies=[Depends(get_api_key)]
)


@router.get("/", response_model=List[FavoriteRecipe])
def get_user_favorites(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all favorite recipes for a user"""
    service = FavoriteRecipeService(db)
    return service.get_user_favorites(user_id, skip, limit)


@router.get("/{recipe_id}", response_model=FavoriteRecipe)
def get_favorite(user_id: int, recipe_id: int, db: Session = Depends(get_db)):
    """Get a specific favorite recipe"""
    service = FavoriteRecipeService(db)
    favorite = service.get_favorite(user_id, recipe_id)
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite recipe not found")
    return favorite


@router.post("/", response_model=FavoriteRecipe, status_code=201)
def add_favorite(user_id: int, favorite_data: FavoriteRecipeCreate, db: Session = Depends(get_db)):
    """Add a recipe to user's favorites"""
    service = FavoriteRecipeService(db)
    return service.add_favorite(user_id, favorite_data)


@router.put("/{recipe_id}", response_model=FavoriteRecipe)
def update_favorite(
    user_id: int, 
    recipe_id: int, 
    favorite_data: FavoriteRecipeUpdate, 
    db: Session = Depends(get_db)
):
    """Update a favorite recipe note"""
    service = FavoriteRecipeService(db)
    favorite = service.update_favorite(user_id, recipe_id, favorite_data)
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite recipe not found")
    return favorite


@router.delete("/{recipe_id}", status_code=204)
def remove_favorite(user_id: int, recipe_id: int, db: Session = Depends(get_db)):
    """Remove a recipe from user's favorites"""
    service = FavoriteRecipeService(db)
    if not service.remove_favorite(user_id, recipe_id):
        raise HTTPException(status_code=404, detail="Favorite recipe not found")


@router.get("/{recipe_id}/check", response_model=dict)
def check_favorite(user_id: int, recipe_id: int, db: Session = Depends(get_db)):
    """Check if a recipe is favorited by the user"""
    service = FavoriteRecipeService(db)
    is_favorited = service.is_favorited(user_id, recipe_id)
    return {"is_favorited": is_favorited}