from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.dependencies import get_api_key
from ..services.recipe_service import RecipeService
from ..schemas.recipe import Recipe, RecipeCreate, RecipeUpdate

router = APIRouter(
    prefix="/recipes",
    tags=["recipes"],
    dependencies=[Depends(get_api_key)]
)


@router.get("/", response_model=List[Recipe])
def get_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all recipes with optional filtering"""
    service = RecipeService(db)
    
    if search:
        return service.search_recipes(search, skip, limit)
    elif category:
        return service.get_recipes_by_category(category, skip, limit)
    else:
        return service.get_all_recipes(skip, limit)


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Get a specific recipe by ID"""
    service = RecipeService(db)
    recipe = service.get_recipe_by_id(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("/", response_model=Recipe, status_code=201)
def create_recipe(recipe_data: RecipeCreate, db: Session = Depends(get_db)):
    """Create a new recipe"""
    service = RecipeService(db)
    return service.create_recipe(recipe_data)


@router.put("/{recipe_id}", response_model=Recipe)
def update_recipe(recipe_id: int, recipe_data: RecipeUpdate, db: Session = Depends(get_db)):
    """Update an existing recipe"""
    service = RecipeService(db)
    recipe = service.update_recipe(recipe_id, recipe_data)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Delete a recipe"""
    service = RecipeService(db)
    if not service.delete_recipe(recipe_id):
        raise HTTPException(status_code=404, detail="Recipe not found")


@router.get("/by-ingredients/")
def get_recipes_by_ingredients(
    ingredient_ids: List[int] = Query(..., description="List of ingredient IDs"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Find recipes that can be made with the given ingredients"""
    service = RecipeService(db)
    return service.get_recipes_by_ingredients(ingredient_ids, skip, limit)