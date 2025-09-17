"""
Database initialization script
"""
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from ..models import User, Recipe, Ingredient, RecipeIngredient, FavoriteRecipe
from ..models.user import UserRole
from ..models.recipe import DifficultyLevel
from ..models.ingredient import IngredientCategory


def init_db():
    """Initialize database with sample data"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Check if we already have data
        if db.query(User).first():
            print("Database already initialized")
            return
        
        # Create sample ingredients
        ingredients = [
            Ingredient(name="Chicken Breast", category=IngredientCategory.protein),
            Ingredient(name="Tomato", category=IngredientCategory.vegetable),
            Ingredient(name="Onion", category=IngredientCategory.vegetable),
            Ingredient(name="Garlic", category=IngredientCategory.vegetable),
            Ingredient(name="Olive Oil", category=IngredientCategory.oil),
            Ingredient(name="Salt", category=IngredientCategory.spice),
            Ingredient(name="Black Pepper", category=IngredientCategory.spice),
        ]
        
        for ingredient in ingredients:
            db.add(ingredient)
        
        # Create sample user
        sample_user = User(
            email="test@example.com",
            hashed_password="hashed_password_here",
            role=UserRole.standard
        )
        db.add(sample_user)
        
        # Commit the changes
        db.commit()
        
        # Create sample recipe
        sample_recipe = Recipe(
            title="Simple Chicken Stir Fry",
            description="A quick and easy chicken stir fry recipe",
            instructions="1. Heat oil in pan\n2. Cook chicken until done\n3. Add vegetables\n4. Season and serve",
            cooking_time_minutes=20,
            difficulty_level=DifficultyLevel.easy,
            servings=2,
            cuisine_type="Asian",
            dietary_tags=["gluten-free", "high-protein"]
        )
        db.add(sample_recipe)
        db.commit()
        
        # Add recipe ingredients
        recipe_ingredients = [
            RecipeIngredient(recipe_id=sample_recipe.id, ingredient_id=1, quantity=1.0, unit="lb"),
            RecipeIngredient(recipe_id=sample_recipe.id, ingredient_id=2, quantity=2.0, unit="pieces"),
            RecipeIngredient(recipe_id=sample_recipe.id, ingredient_id=3, quantity=1.0, unit="piece"),
            RecipeIngredient(recipe_id=sample_recipe.id, ingredient_id=5, quantity=2.0, unit="tbsp"),
        ]
        
        for recipe_ingredient in recipe_ingredients:
            db.add(recipe_ingredient)
        
        db.commit()
        print("Database initialized successfully with sample data")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()