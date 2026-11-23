import { useQuery } from '@tanstack/react-query'
import { api, type ApiSearchHit } from '../../services/api'

export function useSearch(term: string) {
  const query = useQuery({
    queryKey: ['search', term],
    queryFn: () => api.search(term),
    enabled: term.trim().length > 0,
    staleTime: 10_000,
  })
  return { hits: (query.data ?? []) as ApiSearchHit[], isSearching: query.isFetching, error: query.error }
}
