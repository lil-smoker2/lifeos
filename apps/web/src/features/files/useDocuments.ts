import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiDocument } from '../../services/api'

export function useDocuments() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['documents'], queryFn: api.documents.list })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['documents'] })
  const upload = useMutation({
    mutationFn: ({ file, tag }: { file: File; tag?: string }) => api.documents.upload(file, tag),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: (id: string) => api.documents.remove(id), onSuccess: invalidate })
  return {
    documents: (q.data ?? []) as ApiDocument[],
    isLoading: q.isLoading,
    error: q.error,
    upload,
    remove,
  }
}
