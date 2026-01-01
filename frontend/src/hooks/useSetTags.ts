import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { RecipeDetail } from '../../../shared/types/recipe';

interface SetTagsParams {
  recipeId: number;
  tagIds: number[];
}

export function useSetTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId, tagIds }: SetTagsParams) =>
      api.put<RecipeDetail>(`/recipes/${recipeId}/tags`, { tagIds }),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
