// insert into user as well

INSERT INTO `ingredient` (`name`, `category`) VALUES
('Chicken Breast', 'Meat'),          -- Ingredient ID 1
('Olive Oil', 'Fat'),               -- Ingredient ID 2
('Garlic Clove', 'Produce'),          -- Ingredient ID 3
('Broccoli Florets', 'Produce'),     -- Ingredient ID 4
('Spaghetti', 'Grain'),             -- Ingredient ID 5
('Canned Tomatoes', 'Canned Goods'), -- Ingredient ID 6
('Onion', 'Produce'),               -- Ingredient ID 7
('Ground Beef', 'Meat');            -- Ingredient ID 8


INSERT INTO `recipe` (`name`, `category`, `cook_time_in_minutes`, `prep_time_in_minutes`) VALUES
('Garlic Chicken and Broccoli', 'Dinner', 20, 15), -- Recipe ID 1
('Simple Spaghetti Bolognese', 'Dinner', 45, 10);  -- Recipe ID 2

INSERT INTO `recipe_step` (`recipe_id`, `step_order`, `instruction`, `time_in_minutes`) VALUES
-- Recipe 1: Garlic Chicken and Broccoli
(1, 1, 'Cut chicken breast into 1-inch cubes and mince the garlic.', 5),
(1, 2, 'Heat olive oil in a pan and cook chicken until browned.', 10),
(1, 3, 'Add garlic and broccoli florets to the pan. Cook until broccoli is tender-crisp.', 5),

-- Recipe 2: Simple Spaghetti Bolognese
(2, 1, 'In a large pot, bring water to a boil and cook spaghetti according to package directions.', 10),
(2, 2, 'In a separate pan, brown the ground beef and drain excess fat.', 15),
(2, 3, 'Chop the onion. Add onion and garlic to the beef and cook until softened.', 5),
(2, 4, 'Stir in canned tomatoes and simmer for 15 minutes.', 15);

INSERT INTO `recipe_ingredient` (`recipe_id`, `ingredient_id`, `quantity`, `unit`) VALUES
-- Recipe 1: Garlic Chicken and Broccoli
(1, 1, 1.5, 'lbs'),
(1, 2, 2, 'tbsp'),
(1, 3, 3, 'cloves'),
(1, 4, 3, 'cups'),

-- Recipe 2: Simple Spaghetti Bolognese
(2, 5, 1, 'lb'),
(2, 8, 1, 'lb'),
(2, 7, 1, 'medium'),
(2, 3, 2, 'cloves'),
(2, 6, 15, 'oz');

INSERT INTO `user_pantry` (`user_id`, `ingredient_id`, `quantity`, `unit`) VALUES
-- Alice's Pantry (User 1)
(1, 1, 1.0, 'lb'),     -- Chicken Breast
(1, 2, 0.5, 'cup'),    -- Olive Oil
(1, 7, 2, 'medium'),   -- Onion
(1, 5, 0.5, 'lb'),     -- Spaghetti

-- Bob's Pantry (User 2)
(2, 8, 1.5, 'lb'),     -- Ground Beef
(2, 6, 28, 'oz'),      -- Canned Tomatoes
(2, 3, 10, 'cloves');  -- Garlic Clove

INSERT INTO `favorite_recipe` (`user_id`, `recipe_id`, `user_note`) VALUES
-- Alice's Favorites (User 1)
(1, 1, 'Great for a quick weeknight dinner!'),

-- Bob's Favorites (User 2)
(2, 2, 'Classic recipe, always a hit.'),
(2, 1, 'Need to try this one next week.');

INSERT INTO `ingredient_substitute` (`source_ingredient_id`, `name`, `unit`, `category`) VALUES
(1, 'Turkey Breast', NULL, 'Meat'), -- Substitute for Chicken Breast
(4, 'Cauliflower Florets', NULL, 'Produce'); -- Substitute for Broccoli Florets