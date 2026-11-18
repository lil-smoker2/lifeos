import { useState, type FormEvent } from 'react'
import { CheckCircle2, Clock3, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, seedTasks, type Priority, type Task } from '../lib/seed'
import { useLocalStore, uid } from '../lib/useLocalStore'

type Filter = 'all' | 'open' | 'done'

const priorities: Priority[] = ['High', 'Medium', 'Low']

export function TasksPage() {
  const [tasks, setTasks] = useLocalStore<Task[]>(STORE_KEYS.tasks, seedTasks)
  const [filter, setFilter] = useState<Filter>('all')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Study')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [due, setDue] = useState('09:00')

  const visible = tasks.filter(task => {
    if (filter === 'open') return !task.done
    if (filter === 'done') return task.done
    return true
  })

  function addTask(event: FormEvent) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    setTasks(current => [{ id: uid(), title: cleanTitle, category, priority, due, done: false }, ...current])
    setTitle('')
  }

  function toggleTask(id: string) {
    setTasks(current => current.map(task => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  function removeTask(id: string) {
    setTasks(current => current.filter(task => task.id !== id))
  }

  const openCount = tasks.filter(task => !task.done).length
  const doneCount = tasks.length - openCount
  const highCount = tasks.filter(task => !task.done && task.priority === 'High').length

  return (
    <div className="page">
      <PageHeader
        eyebrow="Tasks"
        title="Everything on your plate"
        description="Capture work, study and personal tasks. Completed items sync back to the dashboard."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{openCount}</strong> open</span>
          <span className="kpi"><strong>{highCount}</strong> high priority</span>
          <span className="kpi"><strong>{doneCount}</strong> done</span>
        </div>
      </PageHeader>

      <section className="card">
        <form className="inline-form" onSubmit={addTask}>
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="What needs doing?" aria-label="Task title" required />
          <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Category">
            {['Study', 'Work', 'Meeting', 'Health', 'Finance', 'Personal'].map(option => <option key={option}>{option}</option>)}
          </select>
          <select value={priority} onChange={event => setPriority(event.target.value as Priority)} aria-label="Priority">
            {priorities.map(option => <option key={option}>{option}</option>)}
          </select>
          <input type="time" value={due} onChange={event => setDue(event.target.value)} aria-label="Due time" />
          <button className="btn btn-primary" type="submit"><Plus size={16} /> Add task</button>
        </form>

        <div className="tabs" role="tablist" aria-label="Task filters">
          {(['all', 'open', 'done'] as Filter[]).map(option => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              className={filter === option ? 'active' : ''}
              onClick={() => setFilter(option)}
            >
              {option === 'all' ? 'All tasks' : option === 'open' ? 'Open' : 'Completed'}
            </button>
          ))}
        </div>

        <ul className="task-page-list">
          {visible.map(task => (
            <li className={`task-page-row ${task.done ? 'done' : ''}`} key={task.id}>
              <button
                className={`check ${task.done ? 'checked' : ''}`}
                type="button"
                aria-label={task.done ? `Reopen ${task.title}` : `Complete ${task.title}`}
                onClick={() => toggleTask(task.id)}
              />
              <div className="task-page-copy">
                <strong>{task.title}</strong>
                <div className="task-meta">
                  <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <span className="tag">{task.category}</span>
                  <span className="task-time"><Clock3 size={13} /> {task.due}</span>
                </div>
              </div>
              <button className="icon-ghost" type="button" aria-label={`Delete ${task.title}`} onClick={() => removeTask(task.id)}>
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
        {visible.length === 0 ? (
          <p className="empty"><CheckCircle2 size={18} /> Nothing here. Add a task or switch filters.</p>
        ) : null}
      </section>
    </div>
  )
}
