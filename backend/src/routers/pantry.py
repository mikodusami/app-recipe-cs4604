from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.dependencies import get_api_key
from ..services.user_pantry_service import UserPantryService
from ..schemas.user_pantry import UserPantry, UserPantryCreate, UserPantryUpdate

router = APIRouter(
    prefix="/users/{user_id}/pantry",
    tags=["pantry"],
    dependencies=[Depends(get_api_key)]
)


@router.get("/", response_model=List[UserPantry])
def get_user_pantry(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all pantry items for a user"""
    service = UserPantryService(db)
    
    if category:
        return service.get_pantry_by_category(user_id, category, skip, limit)
    else:
        return service.get_user_pantry(user_id, skip, limit)


@router.get("/{ingredient_id}", response_model=UserPantry)
def get_pantry_item(user_id: int, ingredient_id: int, db: Session = Depends(get_db)):
    """Get a specific pantry item"""
    service = UserPantryService(db)
    item = service.get_pantry_item(user_id, ingredient_id)
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    return item


@router.post("/", response_model=UserPantry, status_code=201)
def add_pantry_item(user_id: int, pantry_data: UserPantryCreate, db: Session = Depends(get_db)):
    """Add an item to user's pantry"""
    service = UserPantryService(db)
    return service.add_pantry_item(user_id, pantry_data)


@router.put("/{ingredient_id}", response_model=UserPantry)
def update_pantry_item(
    user_id: int, 
    ingredient_id: int, 
    pantry_data: UserPantryUpdate, 
    db: Session = Depends(get_db)
):
    """Update a pantry item"""
    service = UserPantryService(db)
    item = service.update_pantry_item(user_id, ingredient_id, pantry_data)
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    return item


@router.delete("/{ingredient_id}", status_code=204)
def remove_pantry_item(user_id: int, ingredient_id: int, db: Session = Depends(get_db)):
    """Remove an item from user's pantry"""
    service = UserPantryService(db)
    if not service.remove_pantry_item(user_id, ingredient_id):
        raise HTTPException(status_code=404, detail="Pantry item not found")