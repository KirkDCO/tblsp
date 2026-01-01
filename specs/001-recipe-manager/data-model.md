# Data Model: Recipe Manager

**Feature**: 001-recipe-manager
**Date**: 2025-12-25

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   Recipe    │──────<│   RecipeTag      │>──────│    Tag      │
└─────────────┘       └──────────────────┘       └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│ Ingredient  │
└─────────────┘
```

## Entities

### Recipe

Primary entity storing all recipe information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| title | TEXT | NOT NULL | Recipe name |
| ingredients_raw | TEXT | NOT NULL | Original ingredients text (preserves formatting) |
| instructions | TEXT | NOT NULL | Preparation steps |
| notes | TEXT | NULL | Optional user notes |
| source_url | TEXT | NULL | Original URL if imported from web |
| rating | INTEGER | NULL, CHECK(1-5) | User rating 1-5 stars, NULL if unrated |
| created_at | TEXT | NOT NULL, ISO8601 | Creation timestamp |
| updated_at | TEXT | NOT NULL, ISO8601 | Last modification timestamp |
| deleted_at | TEXT | NULL, ISO8601 | Soft delete timestamp; NULL = active |

**Indexes**:
- `idx_recipe_deleted_at` on `deleted_at` (filter active vs trashed)
- `idx_recipe_rating` on `rating` (sort by rating)
- `idx_recipe_created_at` on `created_at` (sort by date added)

**Full-Text Search**:
- FTS5 virtual table `recipe_fts` indexing `title`, `ingredients_raw`, `instructions`

### Tag

Labels for categorizing recipes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL, UNIQUE (case-insensitive) | Tag display name |
| name_lower | TEXT | NOT NULL, UNIQUE | Lowercase name for uniqueness/search |
| created_at | TEXT | NOT NULL, ISO8601 | Creation timestamp |

**Indexes**:
- `idx_tag_name_lower` on `name_lower` (case-insensitive lookup)

**Validation**:
- Name must be non-empty, trimmed, max 50 characters
- Case-insensitive uniqueness (stored lowercase in `name_lower`)

### RecipeTag (Junction Table)

Many-to-many relationship between recipes and tags.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| recipe_id | INTEGER | NOT NULL, FK → Recipe(id) ON DELETE CASCADE | Recipe reference |
| tag_id | INTEGER | NOT NULL, FK → Tag(id) ON DELETE CASCADE | Tag reference |
| created_at | TEXT | NOT NULL, ISO8601 | When tag was applied |

**Constraints**:
- PRIMARY KEY (recipe_id, tag_id)
- CASCADE DELETE: Deleting recipe removes its tag associations
- CASCADE DELETE: Deleting tag removes associations from all recipes

### Ingredient

Parsed ingredients for ingredient-specific search.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| recipe_id | INTEGER | NOT NULL, FK → Recipe(id) ON DELETE CASCADE | Parent recipe |
| name | TEXT | NOT NULL | Ingredient name (normalized) |
| name_lower | TEXT | NOT NULL | Lowercase for search |
| quantity | TEXT | NULL | Amount (e.g., "2 cups", "1 lb") |
| original_text | TEXT | NOT NULL | Original line from recipe |
| position | INTEGER | NOT NULL | Order in ingredient list |

**Indexes**:
- `idx_ingredient_recipe_id` on `recipe_id`
- `idx_ingredient_name_lower` on `name_lower` (ingredient search)

**Full-Text Search**:
- FTS5 virtual table `ingredient_fts` indexing `name`, `original_text`

## State Transitions

### Recipe Lifecycle

```
┌──────────┐     create      ┌──────────┐
│  (none)  │ ───────────────>│  Active  │
└──────────┘                 └──────────┘
                                  │
                           delete │ (soft)
                                  ▼
                             ┌──────────┐
                             │ Trashed  │
                             └──────────┘
                              │       │
                      restore │       │ purge (after 30 days)
                              ▼       ▼
                         ┌──────────┐  ┌──────────┐
                         │  Active  │  │ (deleted)│
                         └──────────┘  └──────────┘
```

**States**:
- **Active**: `deleted_at IS NULL` - visible in recipe list, searchable
- **Trashed**: `deleted_at IS NOT NULL` - hidden from main list, shown in trash view
- **Deleted**: Row removed from database (permanent purge)

**Transitions**:
- `create`: Insert new recipe with `deleted_at = NULL`
- `delete (soft)`: Set `deleted_at = NOW()`
- `restore`: Set `deleted_at = NULL`
- `purge`: DELETE row WHERE `deleted_at < NOW() - 30 days`

## Validation Rules

### Recipe

| Field | Rule | Error Code |
|-------|------|------------|
| title | Required, 1-200 chars, trimmed | `RECIPE_TITLE_REQUIRED`, `RECIPE_TITLE_TOO_LONG` |
| ingredients_raw | Required, non-empty | `RECIPE_INGREDIENTS_REQUIRED` |
| instructions | Required, non-empty | `RECIPE_INSTRUCTIONS_REQUIRED` |
| source_url | If provided, must be valid URL | `RECIPE_INVALID_URL` |
| rating | If provided, must be 1-5 | `RECIPE_INVALID_RATING` |

### Tag

| Field | Rule | Error Code |
|-------|------|------------|
| name | Required, 1-50 chars, trimmed | `TAG_NAME_REQUIRED`, `TAG_NAME_TOO_LONG` |
| name | Must be unique (case-insensitive) | `TAG_ALREADY_EXISTS` |

## Sample Data (Seeds)

Initial setup includes 5-10 sample recipes covering:
- Different cuisines (Italian, Mexican, Asian, American)
- Different meal types (breakfast, lunch, dinner, dessert)
- Different difficulties (quick & easy, intermediate)
- Pre-applied tags demonstrating the tagging system
- Mix of rated and unrated recipes

Example seed recipes:
1. "Classic Spaghetti Carbonara" - Tags: Italian, Pasta, Quick
2. "Chicken Tikka Masala" - Tags: Indian, Curry, Dinner
3. "Avocado Toast" - Tags: Breakfast, Vegetarian, Quick
4. "Beef Tacos" - Tags: Mexican, Dinner
5. "Chocolate Chip Cookies" - Tags: Dessert, Baking

## SQLite Schema

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Recipes table
CREATE TABLE recipe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    ingredients_raw TEXT NOT NULL,
    instructions TEXT NOT NULL,
    notes TEXT,
    source_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE INDEX idx_recipe_deleted_at ON recipe(deleted_at);
CREATE INDEX idx_recipe_rating ON recipe(rating);
CREATE INDEX idx_recipe_created_at ON recipe(created_at);

-- Full-text search for recipes
CREATE VIRTUAL TABLE recipe_fts USING fts5(
    title,
    ingredients_raw,
    instructions,
    content='recipe',
    content_rowid='id'
);

-- Tags table
CREATE TABLE tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tag_name_lower ON tag(name_lower);

-- Recipe-Tag junction
CREATE TABLE recipe_tag (
    recipe_id INTEGER NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (recipe_id, tag_id)
);

-- Ingredients table
CREATE TABLE ingredient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL,
    quantity TEXT,
    original_text TEXT NOT NULL,
    position INTEGER NOT NULL
);

CREATE INDEX idx_ingredient_recipe_id ON ingredient(recipe_id);
CREATE INDEX idx_ingredient_name_lower ON ingredient(name_lower);

-- Full-text search for ingredients
CREATE VIRTUAL TABLE ingredient_fts USING fts5(
    name,
    original_text,
    content='ingredient',
    content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER recipe_ai AFTER INSERT ON recipe BEGIN
    INSERT INTO recipe_fts(rowid, title, ingredients_raw, instructions)
    VALUES (new.id, new.title, new.ingredients_raw, new.instructions);
END;

CREATE TRIGGER recipe_ad AFTER DELETE ON recipe BEGIN
    INSERT INTO recipe_fts(recipe_fts, rowid, title, ingredients_raw, instructions)
    VALUES ('delete', old.id, old.title, old.ingredients_raw, old.instructions);
END;

CREATE TRIGGER recipe_au AFTER UPDATE ON recipe BEGIN
    INSERT INTO recipe_fts(recipe_fts, rowid, title, ingredients_raw, instructions)
    VALUES ('delete', old.id, old.title, old.ingredients_raw, old.instructions);
    INSERT INTO recipe_fts(rowid, title, ingredients_raw, instructions)
    VALUES (new.id, new.title, new.ingredients_raw, new.instructions);
END;

CREATE TRIGGER ingredient_ai AFTER INSERT ON ingredient BEGIN
    INSERT INTO ingredient_fts(rowid, name, original_text)
    VALUES (new.id, new.name, new.original_text);
END;

CREATE TRIGGER ingredient_ad AFTER DELETE ON ingredient BEGIN
    INSERT INTO ingredient_fts(ingredient_fts, rowid, name, original_text)
    VALUES ('delete', old.id, old.name, old.original_text);
END;
```
