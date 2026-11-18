import type { EventItem, FileDoc, Note, Task } from './seed'

export type SearchGroup = 'Pages' | 'Tasks' | 'Events' | 'Notes' | 'Files'

export type SearchHit = {
  id: string
  title: string
  subtitle: string
  to: string
  group: SearchGroup
}

export type SearchData = {
  tasks: Task[]
  events: EventItem[]
  notes: Note[]
  files: FileDoc[]
}

const LIMIT_PER_GROUP = 3

export function searchRecords(rawTerm: string, data: SearchData): SearchHit[] {
  const term = rawTerm.trim().toLowerCase()
  if (!term) return []
  const hits: SearchHit[] = []

  data.tasks
    .filter(task => task.title.toLowerCase().includes(term) || task.category.toLowerCase().includes(term))
    .slice(0, LIMIT_PER_GROUP)
    .forEach(task => hits.push({
      id: `task-${task.id}`,
      title: task.title,
      subtitle: `${task.priority} priority · ${task.category} · ${task.due}`,
      to: '/tasks',
      group: 'Tasks',
    }))

  data.events
    .filter(event => event.title.toLowerCase().includes(term) || event.place.toLowerCase().includes(term))
    .slice(0, LIMIT_PER_GROUP)
    .forEach(event => hits.push({
      id: `event-${event.id}`,
      title: event.title,
      subtitle: `Nov ${event.day} · ${event.start} · ${event.place}`,
      to: '/planner',
      group: 'Events',
    }))

  data.notes
    .filter(note => note.title.toLowerCase().includes(term) || note.className.toLowerCase().includes(term))
    .slice(0, LIMIT_PER_GROUP)
    .forEach(note => hits.push({
      id: `note-${note.id}`,
      title: `${note.emoji} ${note.title}`,
      subtitle: `${note.className} · ${note.type}`,
      to: '/notes',
      group: 'Notes',
    }))

  data.files
    .filter(file => file.name.toLowerCase().includes(term) || file.tag.toLowerCase().includes(term))
    .slice(0, LIMIT_PER_GROUP)
    .forEach(file => hits.push({
      id: `file-${file.id}`,
      title: file.name,
      subtitle: `${file.kind} · ${file.size} · ${file.tag}`,
      to: '/files',
      group: 'Files',
    }))

  return hits
}
