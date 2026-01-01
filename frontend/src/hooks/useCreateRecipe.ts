import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { RecipeDetail, RecipeInput } from '../../../shared/types/recipe';

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecipeInput) => api.post<RecipeDetail>('/recipes', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
