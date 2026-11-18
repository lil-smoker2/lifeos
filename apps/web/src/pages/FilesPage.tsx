import { useState, type ChangeEvent } from 'react'
import { FileText, FolderOpen, Image, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, seedFiles, type FileDoc } from '../lib/seed'
import { useLocalStore, uid } from '../lib/useLocalStore'

function fileIcon(kind: string) {
  if (kind === 'PNG' || kind === 'JPG') return <Image size={20} />
  if (kind === 'PDF') return <FileText size={20} />
  return <FolderOpen size={20} />
}

export function FilesPage() {
  const [files, setFiles] = useLocalStore<FileDoc[]>(STORE_KEYS.files, seedFiles)
  const [search, setSearch] = useState('')

  const visible = files.filter(file => file.name.toLowerCase().includes(search.trim().toLowerCase()))

  function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    if (!picked.length) return
    const added: FileDoc[] = picked.map(file => {
      const ext = file.name.split('.').pop()?.toUpperCase() ?? 'FILE'
      const size = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`
      return { id: uid(), name: file.name, kind: ext, size, tag: 'Uploaded' }
    })
    setFiles(current => [...added, ...current])
    event.target.value = ''
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Files & documents"
        title="Your library"
        description="Keep thesis drafts, notes and budgets in one place. Uploads are tracked locally for now."
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
        <div className="file-grid">
          {visible.map(file => (
            <article className="file-card" key={file.id}>
              <span className={`file-icon ${file.kind.toLowerCase()}`}>{fileIcon(file.kind)}</span>
              <div className="file-copy">
                <strong>{file.name}</strong>
                <span>{file.kind} · {file.size}</span>
              </div>
              <span className="tag">{file.tag}</span>
              <button className="icon-ghost" type="button" aria-label={`Delete ${file.name}`} onClick={() => setFiles(current => current.filter(item => item.id !== file.id))}>
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
