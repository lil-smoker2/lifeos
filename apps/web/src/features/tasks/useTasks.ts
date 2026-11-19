import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiTask, type NewTask } from '../../services/api'

export function useTasks() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['tasks'], queryFn: api.tasks.list })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] })

  const create = useMutation({
    mutationFn: (input: NewTask) => api.tasks.create(input),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewTask & { done: boolean }> }) =>
      api.tasks.update(id, changes),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: invalidate,
  })

  return {
    tasks: (query.data ?? []) as ApiTask[],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    remove,
  }
}
