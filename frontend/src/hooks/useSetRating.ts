import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

interface SetRatingParams {
  recipeId: number;
  rating: number | null;
}

export function useSetRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipeId, rating }: SetRatingParams) => {
      if (rating === null) {
        return api.delete(`/recipes/${recipeId}/rating`);
      }
      return api.put(`/recipes/${recipeId}/rating`, { rating });
    },
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
    },
  });
}
