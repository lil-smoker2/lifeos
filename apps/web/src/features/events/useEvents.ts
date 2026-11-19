import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiEvent, type NewEvent } from '../../services/api'

export function useEvents() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['events'], queryFn: api.events.list })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['events'] })

  const create = useMutation({
    mutationFn: (input: NewEvent) => api.events.create(input),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewEvent> }) =>
      api.events.update(id, changes),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.events.remove(id),
    onSuccess: invalidate,
  })

  return {
    events: (query.data ?? []) as ApiEvent[],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    remove,
  }
}
