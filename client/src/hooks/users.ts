import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';

interface getUsersProps {
  limit?: number;
  page?: number;
}

interface UserProps {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
}

interface UsersResponse {
  data: UserProps[];
}

export function useUsers({ limit = 0, page }: getUsersProps = {}) {
  const params = !limit && !page ? {} : { params: { limit, page: page || 1 } };

  return useQuery<UsersResponse>({
    queryKey: ['users', limit, page],
    queryFn: () => apiClient('users', params),
  });
}
