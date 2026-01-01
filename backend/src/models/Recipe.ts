import { getDatabase } from '../db/connection.js';
import type { Recipe, RecipeWithTags, RecipeDetail, RecipeInput } from '../../../shared/types/recipe.js';
import type { Tag } from '../../../shared/types/tag.js';
import type { Ingredient } from '../../../shared/types/ingredient.js';

interface RecipeRow {
  id: number;
  title: string;
  ingredients_raw: string;
  instructions: string;
  notes: string | null;
  source_url: string | null;
  image_url: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  last_viewed_at: string | null;
}

interface TagRow {
  id: number;
  name: string;
  created_at: string;
}

interface IngredientRow {
  id: number;
  name: string;
  quantity: string | null;
  original_text: string;
  position: number;
}

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    ingredientsRaw: row.ingredients_raw,
    instructions: row.instructions,
    notes: row.notes,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    rating: row.rating,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function rowToIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    originalText: row.original_text,
    position: row.position,
  };
}

export interface RecipeSearchOptions {
  search?: string;
  tags?: number[];
  ingredient?: string;
  sort?: 'title' | 'rating' | 'created_at' | 'updated_at' | 'last_viewed_at' | 'random';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

export const RecipeModel = {
  findAll(options: RecipeSearchOptions = {}): { recipes: RecipeWithTags[]; total: number } {
    const db = getDatabase();
    const {
      search,
      tags,
      ingredient,
      sort = 'created_at',
      order = 'desc',
      limit = 50,
      offset = 0,
      includeDeleted = false,
    } = options;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (!includeDeleted) {
      conditions.push('r.deleted_at IS NULL');
    }

    // Full-text search
    if (search) {
      conditions.push(`r.id IN (SELECT rowid FROM recipe_fts WHERE recipe_fts MATCH ?)`);
      params.push(`${search}*`);
    }

    // Ingredient search
    if (ingredient) {
      conditions.push(`r.id IN (
        SELECT DISTINCT recipe_id FROM ingredient
        WHERE name_lower LIKE ?
      )`);
      params.push(`%${ingredient.toLowerCase()}%`);
    }

    // Tag filter
    if (tags && tags.length > 0) {
      const placeholders = tags.map(() => '?').join(',');
      conditions.push(`r.id IN (
        SELECT recipe_id FROM recipe_tag
        WHERE tag_id IN (${placeholders})
        GROUP BY recipe_id
        HAVING COUNT(DISTINCT tag_id) = ?
      )`);
      params.push(...tags, tags.length);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM recipe r ${whereClause}`);
    const countResult = countStmt.get(...params) as { count: number };
    const total = countResult.count;

    // Handle sort
    const validSorts = ['title', 'rating', 'created_at', 'updated_at', 'last_viewed_at'];
    let orderByClause: string;

    if (sort === 'random') {
      orderByClause = 'ORDER BY RANDOM()';
    } else {
      const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      // For last_viewed_at, put nulls last when sorting desc (most recent first)
      if (sortColumn === 'last_viewed_at') {
        orderByClause = `ORDER BY r.${sortColumn} IS NULL, r.${sortColumn} ${sortOrder}`;
      } else {
        orderByClause = `ORDER BY r.${sortColumn} ${sortOrder}`;
      }
    }

    // Get recipes
    const recipesStmt = db.prepare(`
      SELECT r.* FROM recipe r
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `);
    const recipeRows = recipesStmt.all(...params, limit, offset) as RecipeRow[];

    // Get tags for each recipe
    const recipes: RecipeWithTags[] = recipeRows.map((row) => {
      const tagStmt = db.prepare(`
        SELECT t.id, t.name, t.created_at
        FROM tag t
        JOIN recipe_tag rt ON rt.tag_id = t.id
        WHERE rt.recipe_id = ?
        ORDER BY t.name
      `);
      const tagRows = tagStmt.all(row.id) as TagRow[];

      return {
        ...rowToRecipe(row),
        tags: tagRows.map(rowToTag),
      };
    });

    return { recipes, total };
  },

  findById(id: number, updateViewedAt: boolean = true): RecipeDetail | null {
    const db = getDatabase();

    const recipeStmt = db.prepare('SELECT * FROM recipe WHERE id = ? AND deleted_at IS NULL');
    const recipeRow = recipeStmt.get(id) as RecipeRow | undefined;

    if (!recipeRow) {
      return null;
    }

    // Update last_viewed_at timestamp
    if (updateViewedAt) {
      const now = new Date().toISOString();
      const updateStmt = db.prepare('UPDATE recipe SET last_viewed_at = ? WHERE id = ?');
      updateStmt.run(now, id);
    }

    // Get tags
    const tagStmt = db.prepare(`
      SELECT t.id, t.name, t.created_at
      FROM tag t
      JOIN recipe_tag rt ON rt.tag_id = t.id
      WHERE rt.recipe_id = ?
      ORDER BY t.name
    `);
    const tagRows = tagStmt.all(id) as TagRow[];

    // Get ingredients
    const ingredientStmt = db.prepare(`
      SELECT id, name, quantity, original_text, position
      FROM ingredient
      WHERE recipe_id = ?
      ORDER BY position
    `);
    const ingredientRows = ingredientStmt.all(id) as IngredientRow[];

    return {
      ...rowToRecipe(recipeRow),
      tags: tagRows.map(rowToTag),
      ingredients: ingredientRows.map(rowToIngredient),
    };
  },

  create(input: RecipeInput): RecipeDetail {
    const db = getDatabase();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO recipe (title, ingredients_raw, instructions, notes, source_url, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      input.title,
      input.ingredientsRaw,
      input.instructions,
      input.notes ?? null,
      input.sourceUrl ?? null,
      input.imageUrl ?? null,
      now,
      now
    );

    const recipeId = result.lastInsertRowid as number;

    // Add tags if provided
    if (input.tagIds && input.tagIds.length > 0) {
      const tagInsertStmt = db.prepare(`
        INSERT INTO recipe_tag (recipe_id, tag_id, created_at)
        VALUES (?, ?, ?)
      `);
      for (const tagId of input.tagIds) {
        tagInsertStmt.run(recipeId, tagId, now);
      }
    }

    // Parse and insert ingredients
    this.parseAndInsertIngredients(recipeId, input.ingredientsRaw);

    return this.findById(recipeId, false)!;
  },

  update(id: number, input: Partial<RecipeInput>): RecipeDetail | null {
    const db = getDatabase();
    const existing = this.findById(id, false);

    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      params.push(input.title);
    }
    if (input.ingredientsRaw !== undefined) {
      updates.push('ingredients_raw = ?');
      params.push(input.ingredientsRaw);
    }
    if (input.instructions !== undefined) {
      updates.push('instructions = ?');
      params.push(input.instructions);
    }
    if (input.notes !== undefined) {
      updates.push('notes = ?');
      params.push(input.notes);
    }
    if (input.sourceUrl !== undefined) {
      updates.push('source_url = ?');
      params.push(input.sourceUrl);
    }
    if (input.imageUrl !== undefined) {
      updates.push('image_url = ?');
      params.push(input.imageUrl);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(now);
      params.push(id);

      const updateStmt = db.prepare(`UPDATE recipe SET ${updates.join(', ')} WHERE id = ?`);
      updateStmt.run(...params);
    }

    // Update ingredients if ingredientsRaw changed
    if (input.ingredientsRaw !== undefined) {
      const deleteIngredientsStmt = db.prepare('DELETE FROM ingredient WHERE recipe_id = ?');
      deleteIngredientsStmt.run(id);
      this.parseAndInsertIngredients(id, input.ingredientsRaw);
    }

    // Update tags if provided
    if (input.tagIds !== undefined) {
      const deleteTagsStmt = db.prepare('DELETE FROM recipe_tag WHERE recipe_id = ?');
      deleteTagsStmt.run(id);

      const tagInsertStmt = db.prepare(`
        INSERT INTO recipe_tag (recipe_id, tag_id, created_at)
        VALUES (?, ?, ?)
      `);
      for (const tagId of input.tagIds) {
        tagInsertStmt.run(id, tagId, now);
      }
    }

    return this.findById(id, false);
  },

  softDelete(id: number): boolean {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare('UPDATE recipe SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL');
    const result = stmt.run(now, now, id);

    return result.changes > 0;
  },

  restore(id: number): RecipeDetail | null {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare('UPDATE recipe SET deleted_at = NULL, updated_at = ? WHERE id = ? AND deleted_at IS NOT NULL');
    const result = stmt.run(now, id);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id, false);
  },

  findTrashed(): RecipeWithTags[] {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM recipe
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `);
    const rows = stmt.all() as RecipeRow[];

    return rows.map((row) => {
      const tagStmt = db.prepare(`
        SELECT t.id, t.name, t.created_at
        FROM tag t
        JOIN recipe_tag rt ON rt.tag_id = t.id
        WHERE rt.recipe_id = ?
        ORDER BY t.name
      `);
      const tagRows = tagStmt.all(row.id) as TagRow[];

      return {
        ...rowToRecipe(row),
        tags: tagRows.map(rowToTag),
      };
    });
  },

  purgeOld(daysOld: number = 30): number {
    const db = getDatabase();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const stmt = db.prepare('DELETE FROM recipe WHERE deleted_at IS NOT NULL AND deleted_at < ?');
    const result = stmt.run(cutoff.toISOString());

    return result.changes;
  },

  setRating(id: number, rating: number | null): boolean {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare('UPDATE recipe SET rating = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL');
    const result = stmt.run(rating, now, id);

    return result.changes > 0;
  },

  parseAndInsertIngredients(recipeId: number, ingredientsRaw: string): void {
    const db = getDatabase();
    const lines = ingredientsRaw.split('\n').filter((line) => line.trim());

    const insertStmt = db.prepare(`
      INSERT INTO ingredient (recipe_id, name, name_lower, quantity, original_text, position)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    lines.forEach((line, index) => {
      const { name, quantity } = this.parseIngredientLine(line);
      insertStmt.run(recipeId, name, name.toLowerCase(), quantity, line.trim(), index);
    });
  },

  parseIngredientLine(line: string): { name: string; quantity: string | null } {
    const trimmed = line.trim();

    // Simple heuristic: quantity is at the start, followed by the ingredient name
    // Matches patterns like "2 cups flour", "1/2 lb butter", "3 large eggs"
    const quantityPattern = /^([\d½¼¾⅓⅔⅛]+(?:\/\d+)?(?:\s*(?:to|-)\s*[\d½¼¾⅓⅔⅛]+(?:\/\d+)?)?)\s*(cups?|tablespoons?|tbsp?|teaspoons?|tsp?|oz|ounces?|lbs?|pounds?|grams?|g|kg|ml|liters?|l|pinch(?:es)?|dash(?:es)?|small|medium|large|cloves?)?\s*/i;

    const match = trimmed.match(quantityPattern);

    if (match && match[0].length > 0) {
      const quantity = match[0].trim();
      const name = trimmed.slice(match[0].length).trim() || trimmed;
      return { name, quantity };
    }

    return { name: trimmed, quantity: null };
  },
};
