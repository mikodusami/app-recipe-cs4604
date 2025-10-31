from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..repositories.ingredient_repository import IngredientRepository
from ..schemas.ingredient import Ingredient, IngredientCreate, IngredientUpdate, IngredientSubstitute


class IngredientService:
    def __init__(self, db: Session):
        self.repository = IngredientRepository(db)
        self.db = db
        
    def get_all_ingredients(self, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        """ORM version"""
        #return self.repository.get_all(skip, limit)
        
        """SQL version"""
        query = text("""
        SELECT * From ingredient
        LIMIT :limit OFFSET :skip 
        """)
        result = self.db.execute(query, {"skip": skip, "limit": limit})
        rows = result.fetchall()
        ingredients = [Ingredient(**dict(row)) for row in rows]
        return ingredients

    def get_ingredient_by_id(self, ingredient_id: int) -> Optional[Ingredient]:
        #return self.repository.get_by_id(ingredient_id)
        
        query = text("""
        SELECT * From ingredient
        WHERE id = :ingredient_id
        """)
        result = self.db.execute(query, {"ingredient_id": ingredient_id})
        row = result.fetchone()
        return Ingredient(**dict(row))

    def get_ingredient_by_name(self, name: str) -> Optional[Ingredient]:
        #return self.repository.get_by_name(name)
        
        query = text("""
        SELECT * From ingredient
        WHERE name = :name
        """)
        result = self.db.execute(query, {"name": name})
        row = result.fetchone()
        return Ingredient(**dict(row))

    def get_ingredients_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        #return self.repository.get_by_category(category, skip, limit)
        
        query = text("""
        SELECT * From ingredient
        WHERE category = :category
        LIMIT :limit OFFSET :skip 
        """)
        result = self.db.execute(query, {"skip": skip, "limit": limit, "category": category})
        rows = result.fetchall()
        ingredients = [Ingredient(**dict(row)) for row in rows]
        return ingredients
        

    def search_ingredients(self, name: str, skip: int = 0, limit: int = 100) -> List[Ingredient]:
        #return self.repository.search_by_name(name, skip, limit)
        query = text("""
        SELECT * From ingredient
        WHERE name LIKE :name
        LIMIT :limit OFFSET :skip 
        """)
        result = self.db.execute(query, {"skip": skip, "limit": limit, "name": f'%{name}%'})
        rows = result.fetchall()
        ingredients = [Ingredient(**dict(row)) for row in rows]
        return ingredients

    def create_ingredient(self, ingredient_data: IngredientCreate) -> Ingredient:
        #return self.repository.create(ingredient_data)
        
        query = text("""
        INSERT INTO ingredient (name, category)
        VALUES (:name, :category)
        RETURNING id, name, category
        """)
        
        result = self.db.execute(query, {"name": ingredient_data.name, "category": ingredient_data.category})
        self.db.commit()
        row = result.fetchone()
        return Ingredient(**dict(row))
        

    def update_ingredient(self, ingredient_id: int, ingredient_data: IngredientUpdate) -> Optional[Ingredient]:
        #return self.repository.update(ingredient_id, ingredient_data)
        
        query = text("""
            UPDATE ingredient
            SET name = :name, category = :category
            WHERE id = :ingredient_id
            RETURNING id, name, category
        """)

        result = self.db.execute( query, {
            "ingredient_id": ingredient_id,
            "name": ingredient_data.name,
            "category": ingredient_data.category
        })

        self.db.commit()

        row = result.fetchone()
        return Ingredient(**dict(row)) if row else None

    def delete_ingredient(self, ingredient_id: int) -> bool:
        #return self.repository.delete(ingredient_id)
        
        query = text("""
        DELETE FROM ingredient
        WHERE id = :ingredient_id
        """)
        
        
        result = self.db.execute(query, {"ingredient_id": ingredient_id})
        self.db.commit()

        return result.rowcount > 0

    def add_substitute(self, ingredient_id: int, substitute_name: str, unit: Optional[str] = None, category: Optional[str] = None) -> Optional[IngredientSubstitute]:
        #return self.repository.add_substitute(ingredient_id, substitute_name, unit, category)
        
        query = text("""
        INSERT INTO ingredient_substitute (source_ingredient_id, name, unit, category)
        VALUES (:ingredient_id, :name, :unit, :category)
        RETURNING source_ingredient_id, name, unit, category
        """)

        result = self.db.execute(query, {
            "ingredient_id": ingredient_id,
            "name": substitute_name,
            "unit": unit,
            "category": category
        })

        self.db.commit()

        row = result.fetchone()
        return IngredientSubstitute(**dict(row)) if row else None

    def get_unique_categories(self) -> List[str]:
        # """Get all unique ingredient categories"""
        # ingredients = self.repository.get_all(skip=0, limit=1000)  # Get all for categories
        # categories = set()
        # for ingredient in ingredients:
        #     if ingredient.category:
        #         categories.add(ingredient.category)
        # return sorted(list(categories))
        
        query = text("""
        SELECT DISTINCT category 
        FROM ingredient
        WHERE category IS NOT NULL
        ORDER BY category
        """)
        result = self.db.execute(query)
        categories = [row[0] for row in result.fetchall()]
        return categories