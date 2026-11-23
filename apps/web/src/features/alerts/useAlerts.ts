import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiAlert } from '../../services/api'

export function useAlerts() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['alerts'], queryFn: api.alerts.list })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['alerts'] })
  const update = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => api.alerts.update(id, read),
    onSuccess: invalidate,
  })
  const readAll = useMutation({ mutationFn: () => api.alerts.readAll(), onSuccess: invalidate })
  const remove = useMutation({ mutationFn: (id: string) => api.alerts.remove(id), onSuccess: invalidate })
  const alerts = (q.data ?? []) as ApiAlert[]
  return {
    alerts,
    unread: alerts.filter(alert => !alert.read).length,
    isLoading: q.isLoading,
    error: q.error,
    update,
    readAll,
    remove,
  }
}
