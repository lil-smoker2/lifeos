import { useState, type ChangeEvent } from 'react'
import { Download, Eye, FileText, FolderOpen, Image, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useDocuments } from '../features/files/useDocuments'
import { api } from '../services/api'

function fileIcon(kind: string) {
  if (kind === 'PNG' || kind === 'JPG' || kind === 'JPEG' || kind === 'WEBP') return <Image size={20} />
  if (kind === 'PDF') return <FileText size={20} />
  return <FolderOpen size={20} />
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function FilesPage() {
  const { documents: files, upload, remove } = useDocuments()
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const visible = files.filter(file => file.name.toLowerCase().includes(search.trim().toLowerCase()))

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    if (!picked.length) return
    setError('')
    for (const file of picked) {
      try {
        await upload.mutateAsync({ file, tag: 'Uploaded' })
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Upload failed')
      }
    }
    event.target.value = ''
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Files & documents"
        title="Your library"
        description="Keep thesis drafts, notes and budgets in one place. Uploads are stored on the LifeOS API."
      >
        <label className="btn btn-primary upload-btn">
          <Upload size={16} /> Upload files
          <input type="file" multiple onChange={onUpload} />
        </label>
      </PageHeader>

      <section className="card">
        <div className="list-toolbar">
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search files..." aria-label="Search files" />
          <span className="kpi"><strong>{files.length}</strong> files</span>
        </div>
        {error ? <p className="note" role="alert">{error}</p> : null}
        <div className="file-grid">
          {visible.map(file => (
            <article className="file-card" key={file.id}>
              <span className={`file-icon ${file.kind.toLowerCase()}`}>{fileIcon(file.kind)}</span>
              <div className="file-copy">
                <strong>{file.name}</strong>
                <span>{file.kind} · {formatSize(file.size_bytes)}</span>
              </div>
              <span className="tag">{file.tag}</span>
              <button className="icon-ghost" type="button" aria-label={`Preview ${file.name}`} onClick={() => api.documents.preview(file.id)}>
                <Eye size={15} />
              </button>
              <button className="icon-ghost" type="button" aria-label={`Download ${file.name}`} onClick={() => api.documents.download(file.id, file.name)}>
                <Download size={15} />
              </button>
              <button className="icon-ghost" type="button" aria-label={`Delete ${file.name}`} onClick={() => remove.mutate(file.id)}>
                <Trash2 size={15} />
              </button>
            </article>
          ))}
        </div>
        {visible.length === 0 ? <p className="empty">No files match “{search}”.</p> : null}
      </section>
    </div>
  )
}
