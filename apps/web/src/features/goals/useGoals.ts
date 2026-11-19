import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiGoal, type NewGoal } from '../../services/api'

export function useGoals() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['goals'], queryFn: api.goals.list })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['goals'] })
  const create = useMutation({ mutationFn: (i: NewGoal) => api.goals.create(i), onSuccess: invalidate })
  const update = useMutation({ mutationFn: ({ id, changes }: { id: string; changes: Partial<NewGoal & { current: number }> }) => api.goals.update(id, changes), onSuccess: invalidate })
  const remove = useMutation({ mutationFn: (id: string) => api.goals.remove(id), onSuccess: invalidate })
  return { goals: (q.data ?? []) as ApiGoal[], isLoading: q.isLoading, error: q.error, create, update, remove }
}
