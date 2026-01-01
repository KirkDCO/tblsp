import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { RecipeListResponse } from '../../../shared/types/api';

export interface UseRecipesParams {
  search?: string;
  tags?: number[];
  ingredient?: string;
  sort?: 'title' | 'rating' | 'created_at' | 'updated_at' | 'last_viewed_at' | 'random';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export function useRecipes(params: UseRecipesParams = {}) {
  const queryParams: Record<string, string | number | undefined> = {
    search: params.search || undefined,
    tags: params.tags?.join(',') || undefined,
    ingredient: params.ingredient || undefined,
    sort: params.sort,
    order: params.order,
    limit: params.limit,
    offset: params.offset,
  };

  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => api.get<RecipeListResponse>('/recipes', queryParams),
  });
}
