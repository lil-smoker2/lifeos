import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiCourse } from '../../services/api'

export function useCourses() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['courses'], queryFn: api.courses.list })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['courses'] })
  const update = useMutation({ mutationFn: ({ id, done }: { id: string; done: number }) => api.courses.update(id, { done }), onSuccess: invalidate })
  return { courses: (q.data ?? []) as ApiCourse[], isLoading: q.isLoading, error: q.error, update }
}
