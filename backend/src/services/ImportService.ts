import { scrapeRecipe } from '../utils/recipeScraper.js';
import type { ImportedRecipe } from '../../../shared/types/recipe.js';

export const ImportService = {
  async importFromUrl(url: string): Promise<ImportedRecipe> {
    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    return scrapeRecipe(url);
  },
};
