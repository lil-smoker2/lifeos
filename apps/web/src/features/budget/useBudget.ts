import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiBudgetSnapshot } from '../../services/api'

export function useBudget() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['budget'], queryFn: api.budget.get })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['budget'] })

  const setWallet = useMutation({
    mutationFn: (amount: number) => api.budget.setWallet(amount),
    onSuccess: invalidate,
  })
  const setCurrency = useMutation({
    mutationFn: (currency: string) => api.budget.setCurrency(currency),
    onSuccess: invalidate,
  })
  const setDistribution = useMutation({
    mutationFn: (input: { food_pct: number; rent_pct: number; savings_pct: number }) =>
      api.budget.setDistribution(input),
    onSuccess: invalidate,
  })
  const addItem = useMutation({
    mutationFn: (input: { name: string; price: number }) => api.budget.addItem(input),
    onSuccess: invalidate,
  })
  const removeItem = useMutation({
    mutationFn: (id: string) => api.budget.removeItem(id),
    onSuccess: invalidate,
  })
  const regenerateTimetable = useMutation({
    mutationFn: () => api.budget.regenerateTimetable(),
    onSuccess: invalidate,
  })

  const snapshot: ApiBudgetSnapshot | undefined = q.data
  return {
    ...snapshot,
    isLoading: q.isLoading,
    error: q.error,
    setWallet,
    setCurrency,
    setDistribution,
    addItem,
    removeItem,
    regenerateTimetable,
  }
}
