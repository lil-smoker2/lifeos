import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiNote, type NewNote } from '../../services/api'

export function useNotes(limit = 50, offset = 0) {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['notes', limit, offset],
    queryFn: () => api.notes.list(limit, offset),
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['notes'] })
  const create = useMutation({ mutationFn: (i: NewNote) => api.notes.create(i), onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewNote & { reviewed: boolean }> }) =>
      api.notes.update(id, changes),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: (id: string) => api.notes.remove(id), onSuccess: invalidate })
  return { notes: (q.data ?? []) as ApiNote[], isLoading: q.isLoading, error: q.error, create, update, remove }
}
