import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiTxn, type NewTxn } from '../../services/api'

export function useTransactions() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['transactions'], queryFn: api.transactions.list })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['transactions'] })
  const create = useMutation({ mutationFn: (i: NewTxn) => api.transactions.create(i), onSuccess: invalidate })
  const remove = useMutation({ mutationFn: (id: string) => api.transactions.remove(id), onSuccess: invalidate })
  return { transactions: (q.data ?? []) as ApiTxn[], isLoading: q.isLoading, error: q.error, create, remove }
}
