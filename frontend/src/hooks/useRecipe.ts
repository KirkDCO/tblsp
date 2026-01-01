import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { RecipeDetail } from '../../../shared/types/recipe';

export function useRecipe(id: number | null) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => api.get<RecipeDetail>(`/recipes/${id}`),
    enabled: id !== null,
  });
}
