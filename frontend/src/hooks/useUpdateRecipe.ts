import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { RecipeDetail, RecipeInput } from '../../../shared/types/recipe';

interface UpdateRecipeParams {
  id: number;
  input: Partial<RecipeInput>;
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateRecipeParams) =>
      api.put<RecipeDetail>(`/recipes/${id}`, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.setQueryData(['recipe', data.id], data);
    },
  });
}
