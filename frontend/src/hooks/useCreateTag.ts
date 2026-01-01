import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Tag } from '../../../shared/types/tag';

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => api.post<Tag>('/tags', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
