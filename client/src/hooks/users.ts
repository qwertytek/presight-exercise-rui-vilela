import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';

interface getUsersProps {
  limit?: number;
  page?: number;
}

export interface NationalityProps {
  code: string;
  name: string;
}

export interface HobbyProps {
  id: number;
  name: string;
  type: string;
}

export interface UserProps {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: NationalityProps;
  hobbies: HobbyProps[];
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

export function useUsersByName(query: string) {
  return useQuery<UsersResponse>({
    queryKey: ['users', 'filter-name', query],
    queryFn: () => apiClient('users/filter-name', { params: { q: query } }),
    enabled: query.trim().length > 0,
  });
}

export interface FacetItem {
  label: string;
  count: number;
}

export interface FacetsResponse {
  hobbies: FacetItem[];
  nationalities: FacetItem[];
}

export function useFacets(searchQuery: string) {
  const trimmed = searchQuery.trim();
  return useQuery<FacetsResponse>({
    queryKey: ['facets', searchQuery],
    queryFn: () =>
      apiClient<FacetsResponse>(
        'users/facets',
        trimmed.length > 0 ? { params: { q: trimmed } } : {},
      ),
  });
}
