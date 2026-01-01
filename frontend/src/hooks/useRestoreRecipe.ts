import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { RecipeDetail } from '../../../shared/types/recipe';

export function useRestoreRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.post<RecipeDetail>(`/recipes/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['trashedRecipes'] });
    },
  });
}
