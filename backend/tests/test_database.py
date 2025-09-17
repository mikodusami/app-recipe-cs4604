"""
Test database models and connections
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.database import Base
from src.models import User, Recipe, Ingredient, RecipeIngredient
from src.models.user import UserRole
from src.models.recipe import DifficultyLevel
from src.models.ingredient import IngredientCategory


# Create test database
TEST_DATABASE_URL = "sqlite:///./test_cooking_assistant.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture
def test_db():
    """Create test database session"""
    Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


def test_create_user(test_db):
    """Test creating a user"""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        role=UserRole.standard
    )
    test_db.add(user)
    test_db.commit()
    
    # Verify user was created
    saved_user = test_db.query(User).filter(User.email == "test@example.com").first()
    assert saved_user is not None
    assert saved_user.email == "test@example.com"
    assert saved_user.role == UserRole.standard


def test_create_ingredient(test_db):
    """Test creating an ingredient"""
    ingredient = Ingredient(
        name="Test Ingredient",
        category=IngredientCategory.vegetable
    )
    test_db.add(ingredient)
    test_db.commit()
    
    # Verify ingredient was created
    saved_ingredient = test_db.query(Ingredient).filter(Ingredient.name == "Test Ingredient").first()
    assert saved_ingredient is not None
    assert saved_ingredient.name == "Test Ingredient"
    assert saved_ingredient.category == IngredientCategory.vegetable


def test_create_recipe(test_db):
    """Test creating a recipe"""
    recipe = Recipe(
        title="Test Recipe",
        description="A test recipe",
        instructions="Test instructions",
        cooking_time_minutes=30,
        difficulty_level=DifficultyLevel.easy,
        servings=4,
        cuisine_type="Test Cuisine"
    )
    test_db.add(recipe)
    test_db.commit()
    
    # Verify recipe was created
    saved_recipe = test_db.query(Recipe).filter(Recipe.title == "Test Recipe").first()
    assert saved_recipe is not None
    assert saved_recipe.title == "Test Recipe"
    assert saved_recipe.difficulty_level == DifficultyLevel.easy
    assert saved_recipe.servings == 4


def test_recipe_ingredient_relationship(test_db):
    """Test the relationship between recipes and ingredients"""
    # Create ingredient
    ingredient = Ingredient(name="Test Ingredient", category=IngredientCategory.protein)
    test_db.add(ingredient)
    test_db.commit()
    
    # Create recipe
    recipe = Recipe(
        title="Test Recipe",
        instructions="Test instructions",
        cooking_time_minutes=30,
        difficulty_level=DifficultyLevel.medium,
        servings=2
    )
    test_db.add(recipe)
    test_db.commit()
    
    # Create recipe-ingredient relationship
    recipe_ingredient = RecipeIngredient(
        recipe_id=recipe.id,
        ingredient_id=ingredient.id,
        quantity=1.5,
        unit="cups"
    )
    test_db.add(recipe_ingredient)
    test_db.commit()
    
    # Verify relationship
    saved_recipe_ingredient = test_db.query(RecipeIngredient).first()
    assert saved_recipe_ingredient is not None
    assert saved_recipe_ingredient.quantity == 1.5
    assert saved_recipe_ingredient.unit == "cups"
    assert saved_recipe_ingredient.recipe.title == "Test Recipe"
    assert saved_recipe_ingredient.ingredient.name == "Test Ingredient"