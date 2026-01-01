import { getDatabase } from '../db/connection.js';
import type { Ingredient } from '../../../shared/types/ingredient.js';

interface IngredientRow {
  id: number;
  recipe_id: number;
  name: string;
  name_lower: string;
  quantity: string | null;
  original_text: string;
  position: number;
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

export const IngredientModel = {
  findByRecipeId(recipeId: number): Ingredient[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM ingredient
      WHERE recipe_id = ?
      ORDER BY position
    `);
    const rows = stmt.all(recipeId) as IngredientRow[];
    return rows.map(rowToIngredient);
  },

  searchByName(name: string): number[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT DISTINCT recipe_id
      FROM ingredient
      WHERE name_lower LIKE ?
    `);
    const rows = stmt.all(`%${name.toLowerCase()}%`) as { recipe_id: number }[];
    return rows.map((row) => row.recipe_id);
  },

  searchByFTS(query: string): number[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT DISTINCT i.recipe_id
      FROM ingredient i
      JOIN ingredient_fts fts ON fts.rowid = i.id
      WHERE ingredient_fts MATCH ?
    `);
    const rows = stmt.all(`${query}*`) as { recipe_id: number }[];
    return rows.map((row) => row.recipe_id);
  },

  deleteByRecipeId(recipeId: number): number {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM ingredient WHERE recipe_id = ?');
    const result = stmt.run(recipeId);
    return result.changes;
  },

  insertBatch(
    recipeId: number,
    ingredients: Array<{ name: string; quantity: string | null; originalText: string }>
  ): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO ingredient (recipe_id, name, name_lower, quantity, original_text, position)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    ingredients.forEach((ingredient, index) => {
      stmt.run(
        recipeId,
        ingredient.name,
        ingredient.name.toLowerCase(),
        ingredient.quantity,
        ingredient.originalText,
        index
      );
    });
  },

  parseIngredients(
    ingredientsRaw: string
  ): Array<{ name: string; quantity: string | null; originalText: string }> {
    const lines = ingredientsRaw.split('\n').filter((line) => line.trim());

    return lines.map((line) => {
      const trimmed = line.trim();
      const { name, quantity } = this.parseIngredientLine(trimmed);
      return { name, quantity, originalText: trimmed };
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
