import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiHealth } from '../../services/api'

export function useHealth() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['health'], queryFn: api.healthlog.get })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['health'] })
  const update = useMutation({ mutationFn: (i: ApiHealth) => api.healthlog.update(i), onSuccess: invalidate })
  return { health: q.data as ApiHealth | undefined, isLoading: q.isLoading, error: q.error, update }
}
