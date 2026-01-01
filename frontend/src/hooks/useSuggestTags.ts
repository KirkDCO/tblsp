import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import type { TagSuggestion } from '../../../shared/types/tag';

interface SuggestTagsParams {
  title: string;
  ingredientsRaw: string;
  instructions: string;
}

interface SuggestTagsResponse {
  suggestions: TagSuggestion[];
}

export function useSuggestTags() {
  return useMutation({
    mutationFn: (params: SuggestTagsParams) =>
      api.post<SuggestTagsResponse>('/tags/suggest', params),
  });
}
