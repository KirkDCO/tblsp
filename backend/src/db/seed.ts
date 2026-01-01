import { getDatabase } from './connection.js';
import { initializeDatabase } from './init.js';
import { sampleRecipes } from '../../db/seeds/recipes.js';

export function seedDatabase(): void {
  const db = getDatabase();

  // Check if we already have recipes
  const countResult = db.prepare('SELECT COUNT(*) as count FROM recipe').get() as { count: number };
  if (countResult.count > 0) {
    console.log('Database already has recipes, skipping seed');
    return;
  }

  console.log('Seeding database with sample recipes...');

  const now = new Date().toISOString();

  // Create tags first
  const tagMap = new Map<string, number>();
  const allTags = new Set<string>();

  for (const recipe of sampleRecipes) {
    for (const tag of recipe.tags) {
      allTags.add(tag);
    }
  }

  const insertTag = db.prepare(`
    INSERT INTO tag (name, name_lower, created_at)
    VALUES (?, ?, ?)
  `);

  for (const tagName of allTags) {
    const result = insertTag.run(tagName, tagName.toLowerCase(), now);
    tagMap.set(tagName, result.lastInsertRowid as number);
  }

  console.log(`Created ${allTags.size} tags`);

  // Insert recipes
  const insertRecipe = db.prepare(`
    INSERT INTO recipe (title, ingredients_raw, instructions, notes, rating, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecipeTag = db.prepare(`
    INSERT INTO recipe_tag (recipe_id, tag_id, created_at)
    VALUES (?, ?, ?)
  `);

  const insertIngredient = db.prepare(`
    INSERT INTO ingredient (recipe_id, name, name_lower, quantity, original_text, position)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const recipe of sampleRecipes) {
    // Insert recipe
    const result = insertRecipe.run(
      recipe.title,
      recipe.ingredientsRaw,
      recipe.instructions,
      recipe.notes || null,
      recipe.rating || null,
      now,
      now
    );
    const recipeId = result.lastInsertRowid as number;

    // Add tags
    for (const tagName of recipe.tags) {
      const tagId = tagMap.get(tagName)!;
      insertRecipeTag.run(recipeId, tagId, now);
    }

    // Parse and add ingredients
    const lines = recipe.ingredientsRaw.split('\n').filter((line) => line.trim());
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const { name, quantity } = parseIngredientLine(trimmed);
      insertIngredient.run(recipeId, name, name.toLowerCase(), quantity, trimmed, index);
    });
  }

  console.log(`Created ${sampleRecipes.length} recipes`);
  console.log('Database seeding complete!');
}

function parseIngredientLine(line: string): { name: string; quantity: string | null } {
  const trimmed = line.trim();

  const quantityPattern = /^([\d½¼¾⅓⅔⅛]+(?:\/\d+)?(?:\s*(?:to|-)\s*[\d½¼¾⅓⅔⅛]+(?:\/\d+)?)?)\s*(cups?|tablespoons?|tbsp?|teaspoons?|tsp?|oz|ounces?|lbs?|pounds?|grams?|g|kg|ml|liters?|l|pinch(?:es)?|dash(?:es)?|small|medium|large|cloves?|inch)?\s*/i;

  const match = trimmed.match(quantityPattern);

  if (match && match[0].length > 0) {
    const quantity = match[0].trim();
    const name = trimmed.slice(match[0].length).trim() || trimmed;
    return { name, quantity };
  }

  return { name: trimmed, quantity: null };
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
  seedDatabase();
  console.log('Done!');
}
