"""
Database initialization script
"""
from decimal import Decimal
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from ..models import (
    User, UserRole, Recipe, RecipeStep, Ingredient, IngredientSubstitute,
    RecipeIngredient, FavoriteRecipe, UserPantry
)

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
        
        # --- Create Users ---
        # Note: Your provided script had these emails.
        # These will become User ID 1 and User ID 2.
        user1 = User(
            email="user@email.com",
            role=UserRole.standard
        )
        user2 = User(
            email="testuser@example.com", 
            role=UserRole.standard
        )
        db.add(user1)
        db.add(user2)
        db.flush()  # Get IDs for user1 (ID 1) and user2 (ID 2)
        
        # --- Create Ingredients ---
        ingredients_data = [
            ("All-Purpose Flour", "Pantry"),
            ("Large Egg", "Dairy"),
            ("Milk", "Dairy"),
            ("Cheddar Cheese", "Dairy"),
            ("Salt", "Pantry"),
            ("Onion", "Produce"),
            ("Garlic Clove", "Produce"),
            ("Carrot", "Produce"),
            ("Bell Pepper", "Produce"),
            ("Tomato", "Produce"),
            ("Potato", "Produce"),
            ("Lettuce", "Produce"),
            ("Spinach", "Produce"),
            ("Chicken Breast", "Meat"),
            ("Ground Beef", "Meat"),
            ("Bacon", "Meat"),
            ("Olive Oil", "Pantry"),
            ("Black Pepper", "Pantry"),
            ("Sugar", "Pantry"),
            ("Rice", "Pantry"),
            ("Spaghetti", "Pantry"),
            ("Canned Tomatoes", "Pantry"),
            ("Chicken Broth", "Pantry"),
            ("Butter", "Dairy"),
            ("Parmesan Cheese", "Dairy"),
            ("Broccoli Florets", "Produce") # Added from your original
        ]
        
        # Use a map to store ingredients by name for easy reference
        ingredients_map = {}
        for name, category in ingredients_data:
            ingredient = Ingredient(name=name, category=category)
            db.add(ingredient)
            ingredients_map[name] = ingredient
        
        db.flush()  # Get IDs
        
        # --- Create Recipes ---
        recipes_data = [
            ("Fluffy Pancakes", "Breakfast", 15, 10),
            ("Classic Omelette", "Breakfast", 5, 5),
            ("Simple Spaghetti Bolognese", "Dinner", 60, 15),
            ("Chicken Stir-Fry", "Dinner", 15, 15),
            ("Roasted Chicken & Veggies", "Dinner", 75, 20),
            ("Grilled Chicken Caesar Salad", "Lunch", 20, 10),
            ("Beef Tacos", "Dinner", 20, 15),
            ("Creamy Mashed Potatoes", "Side Dish", 25, 10),
            ("Classic Tomato Soup", "Lunch", 30, 10),
            ("Chocolate Chip Cookies", "Dessert", 12, 15)
        ]

        # Use a map to store recipes by name
        recipes_map = {}
        for name, category, cook_time, prep_time in recipes_data:
            recipe = Recipe(
                name=name,
                category=category,
                cook_time_in_minutes=cook_time,
                prep_time_in_minutes=prep_time
            )
            db.add(recipe)
            recipes_map[name] = recipe
            
        db.flush()  # Get IDs
        
        # --- Create Recipe Steps ---
        all_recipe_steps = {
            "Fluffy Pancakes": [
                (1, "In a large bowl, whisk together flour and salt.", 2),
                (2, "In a separate bowl, beat egg and milk. Mix wet ingredients into dry.", 3),
                (3, "Heat a lightly oiled griddle. Pour 1/4 cup batter for each pancake.", 2),
                (4, "Cook until bubbles form, flip, and cook until golden brown.", 3)
            ],
            "Classic Omelette": [
                (1, "Crack 2 eggs into a bowl, add a splash of milk and a pinch of salt. Whisk well.", 2),
                (2, "Heat a non-stick skillet over medium heat with butter.", 1),
                (3, "Pour in egg mixture. As it sets, gently pull the edges toward the center.", 2),
                (4, "Sprinkle with cheese, fold the omelette in half, and slide onto a plate.", 1)
            ],
            "Simple Spaghetti Bolognese": [
                (1, "In a large pot, bring water to a boil and cook spaghetti according to package directions.", 10),
                (2, "In a separate pan, brown the ground beef and drain excess fat.", 15),
                (3, "Chop the onion. Add onion and garlic to the beef and cook until softened.", 5),
                (4, "Stir in canned tomatoes and simmer for 15 minutes.", 15)
            ],
            "Chicken Stir-Fry": [
                (1, "Cook rice according to package directions.", 15),
                (2, "Slice chicken, bell pepper, carrot, and onion into thin strips.", 10),
                (3, "Heat 1 tbsp olive oil in a wok. Cook chicken until no longer pink. Remove from wok.", 5),
                (4, "Add 1 tbsp olive oil and stir-fry vegetables until tender-crisp.", 5),
                (5, "Add chicken back to the wok. Stir to combine and heat through. Serve over rice.", 2)
            ],
            "Roasted Chicken & Veggies": [
                (1, "Preheat oven to 400°F (200°C).", 5),
                (2, "Chop potatoes, carrots, and onion into 1-inch pieces.", 10),
                (3, "Toss chicken and vegetables in a large bowl with olive oil, salt, and pepper.", 5),
                (4, "Spread in a single layer on a baking sheet. Roast for 45-50 minutes.", 50)
            ],
            "Grilled Chicken Caesar Salad": [
                (1, "Season chicken breast with salt and pepper. Grill or pan-sear until cooked through.", 15),
                (2, "Let chicken rest, then slice.", 5),
                (3, "Wash and chop lettuce.", 5),
                (4, "In a large bowl, combine lettuce, sliced chicken, and Parmesan cheese. Toss with dressing.", 2)
            ],
            "Beef Tacos": [
                (1, "In a skillet, cook ground beef with chopped onion until beef is browned.", 10),
                (2, "Drain fat. Stir in taco seasoning and a splash of water. Simmer for 2 minutes.", 2),
                (3, "Warm taco shells. Serve beef mixture in shells, topped with lettuce, tomato, and cheese.", 5)
            ],
            "Creamy Mashed Potatoes": [
                (1, "Peel and cube potatoes. Place in a pot of cold, salted water.", 5),
                (2, "Bring to a boil and cook until fork-tender (about 15-20 minutes).", 20),
                (3, "Drain potatoes well and return to the pot.", 2),
                (4, "Add butter and milk. Mash until smooth. Season with salt and pepper.", 3)
            ],
            "Classic Tomato Soup": [
                (1, "In a large pot, melt butter. Sauté chopped onion and garlic until soft.", 5),
                (2, "Add canned tomatoes and chicken broth. Bring to a simmer.", 5),
                (3, "Reduce heat and cook for 15-20 minutes.", 20),
                (4, "Use an immersion blender to blend the soup until smooth. Season with salt and pepper.", 3)
            ],
            "Chocolate Chip Cookies": [
                (1, "Preheat oven to 375°F (190°C).", 5),
                (2, "In a large bowl, cream together softened butter and sugar.", 3),
                (3, "Beat in the egg. In a separate bowl, whisk together flour and salt.", 2),
                (4, "Gradually add the dry ingredients to the wet ingredients. Stir in chocolate chips.", 3),
                (5, "Drop by rounded spoonfuls onto baking sheets. Bake for 10-12 minutes.", 12)
            ]
        }
        
        for recipe_name, steps in all_recipe_steps.items():
            recipe_obj = recipes_map[recipe_name]
            for step_order, instruction, time_minutes in steps:
                step = RecipeStep(
                    recipe_id=recipe_obj.id,
                    step_order=step_order,
                    instruction=instruction,
                    time_in_minutes=time_minutes
                )
                db.add(step)

        # --- Create Recipe Ingredients (Links) ---
        all_recipe_ingredients = {
            "Fluffy Pancakes": [
                (ingredients_map["All-Purpose Flour"], Decimal("1.5"), "cup"),
                (ingredients_map["Large Egg"], Decimal("1"), "unit"),
                (ingredients_map["Milk"], Decimal("1.25"), "cup"),
                (ingredients_map["Salt"], Decimal("0.5"), "tsp")
            ],
            "Classic Omelette": [
                (ingredients_map["Large Egg"], Decimal("2"), "unit"),
                (ingredients_map["Milk"], Decimal("1"), "tbsp"),
                (ingredients_map["Cheddar Cheese"], Decimal("0.25"), "cup"),
                (ingredients_map["Salt"], Decimal("1"), "pinch")
            ],
            "Simple Spaghetti Bolognese": [
                (ingredients_map["Olive Oil"], Decimal("2"), "tbsp"),
                (ingredients_map["Onion"], Decimal("1"), "unit"),
                (ingredients_map["Garlic Clove"], Decimal("3"), "cloves"),
                (ingredients_map["Ground Beef"], Decimal("1"), "lb"),
                (ingredients_map["Canned Tomatoes"], Decimal("28"), "oz"),
                (ingredients_map["Spaghetti"], Decimal("16"), "oz"),
                (ingredients_map["Parmesan Cheese"], Decimal("0.5"), "cup")
            ],
            "Chicken Stir-Fry": [
                (ingredients_map["Rice"], Decimal("1.5"), "cup"),
                (ingredients_map["Chicken Breast"], Decimal("1"), "lb"),
                (ingredients_map["Bell Pepper"], Decimal("1"), "unit"),
                (ingredients_map["Carrot"], Decimal("1"), "unit"),
                (ingredients_map["Onion"], Decimal("1"), "unit"),
                (ingredients_map["Olive Oil"], Decimal("2"), "tbsp")
            ],
            "Roasted Chicken & Veggies": [
                (ingredients_map["Chicken Breast"], Decimal("2"), "lb"),
                (ingredients_map["Potato"], Decimal("1.5"), "lb"),
                (ingredients_map["Carrot"], Decimal("3"), "unit"),
                (ingredients_map["Onion"], Decimal("1"), "unit"),
                (ingredients_map["Olive Oil"], Decimal("3"), "tbsp"),
                (ingredients_map["Salt"], Decimal("1"), "tsp"),
                (ingredients_map["Black Pepper"], Decimal("0.5"), "tsp")
            ],
            "Grilled Chicken Caesar Salad": [
                (ingredients_map["Chicken Breast"], Decimal("1"), "lb"),
                (ingredients_map["Lettuce"], Decimal("1"), "head"),
                (ingredients_map["Parmesan Cheese"], Decimal("0.5"), "cup")
            ],
            "Beef Tacos": [
                (ingredients_map["Ground Beef"], Decimal("1"), "lb"),
                (ingredients_map["Onion"], Decimal("1"), "unit"),
                (ingredients_map["Lettuce"], Decimal("1"), "cup"),
                (ingredients_map["Tomato"], Decimal("2"), "unit"),
                (ingredients_map["Cheddar Cheese"], Decimal("1"), "cup")
            ],
            "Creamy Mashed Potatoes": [
                (ingredients_map["Potato"], Decimal("2"), "lb"),
                (ingredients_map["Butter"], Decimal("4"), "tbsp"),
                (ingredients_map["Milk"], Decimal("0.5"), "cup"),
                (ingredients_map["Salt"], Decimal("1"), "tsp")
            ],
            "Classic Tomato Soup": [
                (ingredients_map["Butter"], Decimal("2"), "tbsp"),
                (ingredients_map["Onion"], Decimal("1"), "unit"),
                (ingredients_map["Garlic Clove"], Decimal("2"), "cloves"),
                (ingredients_map["Canned Tomatoes"], Decimal("28"), "oz"),
                (ingredients_map["Chicken Broth"], Decimal("2"), "cup")
            ],
            "Chocolate Chip Cookies": [
                (ingredients_map["All-Purpose Flour"], Decimal("2.25"), "cup"),
                (ingredients_map["Sugar"], Decimal("0.75"), "cup"),
                (ingredients_map["Butter"], Decimal("1"), "cup"),
                (ingredients_map["Large Egg"], Decimal("2"), "unit"),
                (ingredients_map["Salt"], Decimal("1"), "tsp")
            ]
        }

        for recipe_name, ingredients_list in all_recipe_ingredients.items():
            recipe_obj = recipes_map[recipe_name]
            for ingredient_obj, quantity, unit in ingredients_list:
                ri = RecipeIngredient(
                    recipe_id=recipe_obj.id,
                    ingredient_id=ingredient_obj.id,
                    quantity=quantity,
                    unit=unit
                )
                db.add(ri)
        
        # --- Create User Pantries ---
        user1_pantry_data = [
            (ingredients_map["All-Purpose Flour"], Decimal("1"), "bag"),
            (ingredients_map["Large Egg"], Decimal("12"), "unit"),
            (ingredients_map["Milk"], Decimal("0.5"), "gallon"),
            (ingredients_map["Salt"], Decimal("1"), "shaker"),
            (ingredients_map["Olive Oil"], Decimal("1"), "bottle"),
            (ingredients_map["Black Pepper"], Decimal("1"), "shaker"),
            (ingredients_map["Butter"], Decimal("1"), "stick")
        ]
        
        user2_pantry_data = [
            (ingredients_map["Onion"], Decimal("3"), "unit"),
            (ingredients_map["Garlic Clove"], Decimal("1"), "head"),
            (ingredients_map["Potato"], Decimal("5"), "lb"),
            (ingredients_map["Chicken Breast"], Decimal("2"), "lb"),
            (ingredients_map["Ground Beef"], Decimal("1"), "lb"),
            (ingredients_map["Spaghetti"], Decimal("1"), "box"),
            (ingredients_map["Canned Tomatoes"], Decimal("4"), "can")
        ]
        
        for ingredient_obj, quantity, unit in user1_pantry_data:
            pantry_item = UserPantry(
                user_id=user1.id,
                ingredient_id=ingredient_obj.id,
                quantity=quantity,
                unit=unit
            )
            db.add(pantry_item)
            
        for ingredient_obj, quantity, unit in user2_pantry_data:
            pantry_item = UserPantry(
                user_id=user2.id,
                ingredient_id=ingredient_obj.id,
                quantity=quantity,
                unit=unit
            )
            db.add(pantry_item)
        
        # --- Create Favorite Recipes ---
        user1_favorites = [
            (recipes_map["Fluffy Pancakes"], "My favorite weekend breakfast!"),
            (recipes_map["Classic Tomato Soup"], "So creamy. Great with grilled cheese."),
            (recipes_map["Chocolate Chip Cookies"], "Best cookies ever.")
        ]
        
        user2_favorites = [
            (recipes_map["Simple Spaghetti Bolognese"], "Easy weeknight dinner."),
            (recipes_map["Roasted Chicken & Veggies"], "Family loves this."),
            (recipes_map["Beef Tacos"], "Taco Tuesday!")
        ]

        for recipe_obj, note in user1_favorites:
            fav = FavoriteRecipe(
                user_id=user1.id,
                recipe_id=recipe_obj.id,
                user_note=note
            )
            db.add(fav)

        for recipe_obj, note in user2_favorites:
            fav = FavoriteRecipe(
                user_id=user2.id,
                recipe_id=recipe_obj.id,
                user_note=note
            )
            db.add(fav)
        
        # --- Create Ingredient Substitutes ---
        substitutes_data = [
            (ingredients_map["All-Purpose Flour"], "Almond Flour", "Pantry"),
            (ingredients_map["All-Purpose Flour"], "Bread Flour", "Pantry"),
            (ingredients_map["Milk"], "Almond Milk", "Dairy-Free"),
            (ingredients_map["Olive Oil"], "Avocado Oil", "Pantry"),
            (ingredients_map["Olive Oil"], "Coconut Oil", "Pantry"),
            (ingredients_map["Butter"], "Margarine", "Dairy-Free"),
            (ingredients_map["Sugar"], "Honey", "Pantry"),
            (ingredients_map["Ground Beef"], "Ground Turkey", "Meat"),
            (ingredients_map["Broccoli Florets"], "Cauliflower Florets", "Produce")
        ]
        
        for source_obj, sub_name, sub_cat in substitutes_data:
            sub = IngredientSubstitute(
                source_ingredient_id=source_obj.id,
                name=sub_name,
                category=sub_cat
            )
            db.add(sub)
        
        # --- Commit ---
        db.commit()
        print("Database initialized successfully with sample data")
        print(f"Created users: {user1.email} (ID: {user1.id}), {user2.email} (ID: {user2.id})")
        print(f"Created {len(ingredients_map)} ingredients")
        print(f"Created {len(recipes_map)} recipes with steps and ingredients")
        print("Created pantry items, favorite recipes, and substitutes")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()