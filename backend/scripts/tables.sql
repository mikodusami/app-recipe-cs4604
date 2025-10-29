-- RECIPE (id, name, category, cook_time_in_minutes, prep_time_in_minutes)
CREATE TABLE `recipe` (
  `id`                       INT PRIMARY KEY AUTO_INCREMENT,
  `name`                     VARCHAR(255) NOT NULL,
  `category`                 VARCHAR(64) NULL,
  `cook_time_in_minutes`     INT NULL,
  `prep_time_in_minutes`     INT NULL
) ENGINE=InnoDB;

---

-- INGREDIENT (id, name, category)
CREATE TABLE `ingredient` (
  `id`       INT PRIMARY KEY AUTO_INCREMENT,
  `name`     VARCHAR(128) NOT NULL,
  `category` VARCHAR(64) NULL,
  CONSTRAINT uq_ingredient_name UNIQUE (`name`)
) ENGINE=InnoDB;

---

-- RECIPE_INGREDIENT (recipe_id, ingredient_id, quantity, unit)
CREATE TABLE `recipe_ingredient` (
  `recipe_id`     INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `quantity`      DECIMAL(10,2) NOT NULL,
  `unit`          VARCHAR(32) NULL,
  PRIMARY KEY (`recipe_id`, `ingredient_id`),
  CONSTRAINT fk_ri_recipe
    FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_ri_ingredient
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

---

-- FAVORITE_RECIPE (user_id, recipe_id, user_note, favorited_at)
CREATE TABLE `favorite_recipe` (
  `user_id`      INT NOT NULL,
  `recipe_id`    INT NOT NULL,
  `user_note`    VARCHAR(500) NULL,
  `favorited_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `recipe_id`),
  -- Note: The 'user' table is assumed to exist and use INT for its ID
  CONSTRAINT fk_fav_user
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_fav_recipe
    FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

---

-- USER_PANTRY (user_id, ingredient_id, quantity, unit)
CREATE TABLE `user_pantry` (
  `user_id`       INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `quantity`      DECIMAL(10,2) NOT NULL,
  `unit`          VARCHAR(32) NULL,
  PRIMARY KEY (`user_id`, `ingredient_id`),
  -- Note: The 'user' table is assumed to exist and use INT for its ID
  CONSTRAINT fk_pantry_user
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_pantry_ingredient
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

---

-- INGREDIENT_SUBSTITUTE (source_ingredient_id, name, unit, category)
CREATE TABLE `ingredient_substitute` (
  `source_ingredient_id` INT NOT NULL,
  `name`                 VARCHAR(128) NOT NULL,
  `unit`                 VARCHAR(32) NULL,
  `category`             VARCHAR(64) NULL,
  PRIMARY KEY (`source_ingredient_id`, `name`),
  CONSTRAINT fk_sub_source
    FOREIGN KEY (`source_ingredient_id`) REFERENCES `ingredient`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

---

-- RECIPE_STEP (recipe_id, step_order, instruction, time_in_minutes)
CREATE TABLE `recipe_step` (
  `recipe_id`             INT NOT NULL,
  `step_order`            INT    NOT NULL,
  `instruction`           TEXT   NOT NULL,
  `time_in_minutes`       INT    NULL,
  PRIMARY KEY (`recipe_id`, `step_order`),
  CONSTRAINT fk_steps_recipe
    FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;