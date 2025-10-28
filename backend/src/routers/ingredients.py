from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.dependencies import get_api_key
from ..services.ingredient_service import IngredientService
from ..schemas.ingredient import Ingredient, IngredientCreate, IngredientUpdate, IngredientSubstituteCreate

router = APIRouter(
    prefix="/ingredients",
    tags=["ingredients"],
    dependencies=[Depends(get_api_key)]
)


@router.get("/", response_model=List[Ingredient])
def get_ingredients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all ingredients with optional filtering"""
    service = IngredientService(db)
    
    if search:
        return service.search_ingredients(search, skip, limit)
    elif category:
        return service.get_ingredients_by_category(category, skip, limit)
    else:
        return service.get_all_ingredients(skip, limit)


@router.get("/categories", response_model=List[str])
def get_ingredient_categories(db: Session = Depends(get_db)):
    """Get all unique ingredient categories"""
    service = IngredientService(db)
    return service.get_unique_categories()


@router.get("/{ingredient_id}", response_model=Ingredient)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """Get a specific ingredient by ID"""
    service = IngredientService(db)
    ingredient = service.get_ingredient_by_id(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.post("/", response_model=Ingredient, status_code=201)
def create_ingredient(ingredient_data: IngredientCreate, db: Session = Depends(get_db)):
    """Create a new ingredient"""
    service = IngredientService(db)
    return service.create_ingredient(ingredient_data)


@router.put("/{ingredient_id}", response_model=Ingredient)
def update_ingredient(ingredient_id: int, ingredient_data: IngredientUpdate, db: Session = Depends(get_db)):
    """Update an existing ingredient"""
    service = IngredientService(db)
    ingredient = service.update_ingredient(ingredient_id, ingredient_data)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.delete("/{ingredient_id}", status_code=204)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """Delete an ingredient"""
    service = IngredientService(db)
    if not service.delete_ingredient(ingredient_id):
        raise HTTPException(status_code=404, detail="Ingredient not found")


@router.post("/{ingredient_id}/substitutes", status_code=201)
def add_substitute(
    ingredient_id: int, 
    substitute_data: IngredientSubstituteCreate, 
    db: Session = Depends(get_db)
):
    """Add a substitute for an ingredient"""
    service = IngredientService(db)
    substitute = service.add_substitute(
        ingredient_id, 
        substitute_data.name, 
        substitute_data.unit, 
        substitute_data.category
    )
    if not substitute:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return substitute