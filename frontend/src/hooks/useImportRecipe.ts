import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ImportedRecipe } from '../../../shared/types/recipe';

interface ImportParams {
  url: string;
}

export function useImportRecipe() {
  return useMutation({
    mutationFn: ({ url }: ImportParams) => api.post<ImportedRecipe>('/import', { url }),
  });
}
