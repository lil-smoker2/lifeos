import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiActivity, type ApiRule, type NewRule } from '../../services/api'

export function useAutomation() {
  const qc = useQueryClient()
  const rulesQuery = useQuery({ queryKey: ['automation', 'rules'], queryFn: api.automation.rules })
  const activityQuery = useQuery({ queryKey: ['automation', 'activity'], queryFn: api.automation.activity })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['automation', 'rules'] })
    qc.invalidateQueries({ queryKey: ['automation', 'activity'] })
  }

  const createRule = useMutation({
    mutationFn: (input: NewRule) => api.automation.createRule(input),
    onSuccess: invalidate,
  })
  const updateRule = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewRule> }) =>
      api.automation.updateRule(id, changes),
    onSuccess: invalidate,
  })
  const removeRule = useMutation({ mutationFn: (id: string) => api.automation.removeRule(id), onSuccess: invalidate })
  const runRule = useMutation({ mutationFn: (id: string) => api.automation.runRule(id), onSuccess: invalidate })

  return {
    rules: (rulesQuery.data ?? []) as ApiRule[],
    activity: (activityQuery.data ?? []) as ApiActivity[],
    isLoading: rulesQuery.isLoading || activityQuery.isLoading,
    error: rulesQuery.error ?? activityQuery.error,
    createRule,
    updateRule,
    removeRule,
    runRule,
  }
}
