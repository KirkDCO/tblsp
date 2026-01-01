import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { TagWithCount } from '../../../shared/types/tag';

interface TagsResponse {
  tags: TagWithCount[];
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagsResponse>('/tags'),
    select: (data) => data.tags,
  });
}
