-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Recipes table
CREATE TABLE IF NOT EXISTS recipe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    ingredients_raw TEXT NOT NULL,
    instructions TEXT NOT NULL,
    notes TEXT,
    source_url TEXT,
    image_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    last_viewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_recipe_deleted_at ON recipe(deleted_at);
CREATE INDEX IF NOT EXISTS idx_recipe_rating ON recipe(rating);
CREATE INDEX IF NOT EXISTS idx_recipe_created_at ON recipe(created_at);
CREATE INDEX IF NOT EXISTS idx_recipe_last_viewed_at ON recipe(last_viewed_at);

-- Full-text search for recipes
CREATE VIRTUAL TABLE IF NOT EXISTS recipe_fts USING fts5(
    title,
    ingredients_raw,
    instructions,
    content='recipe',
    content_rowid='id'
);

-- Tags table
CREATE TABLE IF NOT EXISTS tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tag_name_lower ON tag(name_lower);

-- Recipe-Tag junction
CREATE TABLE IF NOT EXISTS recipe_tag (
    recipe_id INTEGER NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (recipe_id, tag_id)
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL,
    quantity TEXT,
    original_text TEXT NOT NULL,
    position INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingredient_recipe_id ON ingredient(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_name_lower ON ingredient(name_lower);

-- Full-text search for ingredients
CREATE VIRTUAL TABLE IF NOT EXISTS ingredient_fts USING fts5(
    name,
    original_text,
    content='ingredient',
    content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS recipe_ai AFTER INSERT ON recipe BEGIN
    INSERT INTO recipe_fts(rowid, title, ingredients_raw, instructions)
    VALUES (new.id, new.title, new.ingredients_raw, new.instructions);
END;

CREATE TRIGGER IF NOT EXISTS recipe_ad AFTER DELETE ON recipe BEGIN
    INSERT INTO recipe_fts(recipe_fts, rowid, title, ingredients_raw, instructions)
    VALUES ('delete', old.id, old.title, old.ingredients_raw, old.instructions);
END;

CREATE TRIGGER IF NOT EXISTS recipe_au AFTER UPDATE ON recipe BEGIN
    INSERT INTO recipe_fts(recipe_fts, rowid, title, ingredients_raw, instructions)
    VALUES ('delete', old.id, old.title, old.ingredients_raw, old.instructions);
    INSERT INTO recipe_fts(rowid, title, ingredients_raw, instructions)
    VALUES (new.id, new.title, new.ingredients_raw, new.instructions);
END;

CREATE TRIGGER IF NOT EXISTS ingredient_ai AFTER INSERT ON ingredient BEGIN
    INSERT INTO ingredient_fts(rowid, name, original_text)
    VALUES (new.id, new.name, new.original_text);
END;

CREATE TRIGGER IF NOT EXISTS ingredient_ad AFTER DELETE ON ingredient BEGIN
    INSERT INTO ingredient_fts(ingredient_fts, rowid, name, original_text)
    VALUES ('delete', old.id, old.name, old.original_text);
END;
