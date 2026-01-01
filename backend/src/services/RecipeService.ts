import { RecipeModel, type RecipeSearchOptions } from '../models/Recipe.js';
import type { RecipeWithTags, RecipeDetail, RecipeInput } from '../../../shared/types/recipe.js';
import type { RecipeListResponse, RecipeSearchParams } from '../../../shared/types/api.js';

export const RecipeService = {
  search(params: RecipeSearchParams): RecipeListResponse {
    const options: RecipeSearchOptions = {
      search: params.search,
      ingredient: params.ingredient,
      sort: params.sort,
      order: params.order,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    };

    // Parse comma-separated tag IDs
    if (params.tags) {
      const tagIds = params.tags
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
      if (tagIds.length > 0) {
        options.tags = tagIds;
      }
    }

    const { recipes, total } = RecipeModel.findAll(options);

    return {
      recipes,
      total,
      limit: options.limit!,
      offset: options.offset!,
    };
  },

  getById(id: number): RecipeDetail | null {
    return RecipeModel.findById(id);
  },

  create(input: RecipeInput): RecipeDetail {
    return RecipeModel.create(input);
  },

  update(id: number, input: Partial<RecipeInput>): RecipeDetail | null {
    return RecipeModel.update(id, input);
  },

  softDelete(id: number): boolean {
    return RecipeModel.softDelete(id);
  },

  restore(id: number): RecipeDetail | null {
    return RecipeModel.restore(id);
  },

  getTrashed(): RecipeWithTags[] {
    return RecipeModel.findTrashed();
  },

  purgeOld(daysOld: number = 30): number {
    return RecipeModel.purgeOld(daysOld);
  },

  setRating(id: number, rating: number | null): boolean {
    return RecipeModel.setRating(id, rating);
  },
};
