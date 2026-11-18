import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, seedNotes, type Note } from '../lib/seed'
import { useLocalStore, uid } from '../lib/useLocalStore'

const TYPES = ['Lecture', 'Reading', 'Study Group', 'Section', 'Seminar']

export function NotesPage() {
  const [notes, setNotes] = useLocalStore<Note[]>(STORE_KEYS.notes, seedNotes)
  const [tab, setTab] = useState<'all' | 'class' | 'review'>('all')
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📝')
  const [className, setClassName] = useState('ENG 455')
  const [type, setType] = useState('Lecture')

  const visible = notes.filter(note => {
    if (tab === 'class') return note.className === 'ENG 455'
    if (tab === 'review') return !note.reviewed
    return true
  })

  function addNote(event: FormEvent) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    setNotes(current => [{ id: uid(), title: cleanTitle, emoji: emoji || '📝', className, type, reviewed: false }, ...current])
    setTitle('')
    setCreating(false)
  }

  function toggleReviewed(id: string) {
    setNotes(current => current.map(note => (note.id === id ? { ...note, reviewed: !note.reviewed } : note)))
  }

  return (
    <div className="page notes-page">
      <section className="notion-cover" aria-hidden="true">
        <span>📝</span>
      </section>

      <PageHeader
        eyebrow="Notes & knowledge"
        title="My knowledge base"
        description="Notion-style database of lecture notes, readings and study groups."
      />

      <div className="notion-tabs" role="tablist" aria-label="Note filters">
        <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All notes</button>
        <button type="button" role="tab" aria-selected={tab === 'class'} className={tab === 'class' ? 'active' : ''} onClick={() => setTab('class')}>ENG 455</button>
        <button type="button" role="tab" aria-selected={tab === 'review'} className={tab === 'review' ? 'active' : ''} onClick={() => setTab('review')}>To review</button>
        <button type="button" className="tab-add" aria-label="New note" onClick={() => setCreating(!creating)}><Plus size={15} /></button>
      </div>

      {creating ? (
        <form className="inline-form note-form" onSubmit={addNote}>
          <input value={emoji} onChange={event => setEmoji(event.target.value)} aria-label="Emoji" className="emoji-input" maxLength={2} />
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Note title" aria-label="Note title" required />
          <select value={className} onChange={event => setClassName(event.target.value)} aria-label="Class">
            {['ENG 455', 'COSC 210', 'ECON 302', 'Python'].map(option => <option key={option}>{option}</option>)}
          </select>
          <select value={type} onChange={event => setType(event.target.value)} aria-label="Type">
            {TYPES.map(option => <option key={option}>{option}</option>)}
          </select>
          <button className="btn btn-primary" type="submit"><Plus size={16} /> Create</button>
        </form>
      ) : null}

      <div className="notion-wrap">
        <table className="notion-table">
          <thead>
            <tr><th scope="col">Reviewed</th><th scope="col">Name</th><th scope="col">Class</th><th scope="col">Type</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {visible.map(note => (
              <tr key={note.id}>
                <td>
                  <input type="checkbox" checked={note.reviewed} onChange={() => toggleReviewed(note.id)} aria-label={`Mark ${note.title} reviewed`} />
                </td>
                <td><span className="note-name">{note.emoji} {note.title}</span></td>
                <td><span className={`class-pill ${note.className.split(' ')[0].toLowerCase()}`}>{note.className}</span></td>
                <td><span className="type-pill">{note.type}</span></td>
                <td>
                  <button className="icon-ghost" type="button" aria-label={`Delete ${note.title}`} onClick={() => setNotes(current => current.filter(item => item.id !== note.id))}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="notion-footer">
          <button type="button" onClick={() => setCreating(true)}><Plus size={14} /> New</button>
          <span>COUNT {visible.length}</span>
        </div>
      </div>
    </div>
  )
}
