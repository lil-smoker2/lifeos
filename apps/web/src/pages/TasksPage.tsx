import { useState, type FormEvent } from 'react'
import { CheckCircle2, Clock3, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useTasks } from '../features/tasks/useTasks'
import type { Priority } from '../lib/seed'

type Filter = 'all' | 'open' | 'done'

const priorities: Priority[] = ['High', 'Medium', 'Low']

export function TasksPage() {
  const { tasks, isLoading, error, create, update, remove } = useTasks()
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

  async function addTask(event: FormEvent) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    await create.mutateAsync({ title: cleanTitle, category, priority, due })
    setTitle('')
  }

  const openCount = tasks.filter(task => !task.done).length
  const doneCount = tasks.length - openCount
  const highCount = tasks.filter(task => !task.done && task.priority === 'High').length

  return (
    <div className="page">
      <PageHeader
        eyebrow="Tasks"
        title="Everything on your plate"
        description="Capture work, study and personal tasks. Saved to your LifeOS account."
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
          <button className="btn btn-primary" type="submit" disabled={create.isPending}>
            <Plus size={16} /> {create.isPending ? 'Adding...' : 'Add task'}
          </button>
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

        {isLoading ? <p className="empty">Loading tasks from the API...</p> : null}
        {error ? <p className="form-error" role="alert">Could not load tasks. Is the LifeOS API running on port 8000?</p> : null}

        <ul className="task-page-list">
          {visible.map(task => (
            <li className={`task-page-row ${task.done ? 'done' : ''}`} key={task.id}>
              <button
                className={`check ${task.done ? 'checked' : ''}`}
                type="button"
                aria-label={task.done ? `Reopen ${task.title}` : `Complete ${task.title}`}
                onClick={() => update.mutate({ id: task.id, changes: { done: !task.done } })}
              />
              <div className="task-page-copy">
                <strong>{task.title}</strong>
                <div className="task-meta">
                  <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <span className="tag">{task.category}</span>
                  <span className="task-time"><Clock3 size={13} /> {task.due}</span>
                </div>
              </div>
              <button className="icon-ghost" type="button" aria-label={`Delete ${task.title}`} onClick={() => remove.mutate(task.id)}>
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
        {!isLoading && visible.length === 0 ? (
          <p className="empty"><CheckCircle2 size={18} /> Nothing here. Add a task or switch filters.</p>
        ) : null}
      </section>
    </div>
  )
}
