import { useState, type FormEvent } from 'react'
import { Flame, Laptop, Plus, Target, Trash2, Trophy } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useGoals } from '../features/goals/useGoals'
import { goalPercent } from '../lib/seed'

const ICONS = [Trophy, Laptop, Flame, Target]

export function GoalsPage() {
  const { goals, create, update, remove } = useGoals()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('10')
  const [unit, setUnit] = useState('books')

  const average = Math.round(goals.reduce((sum, goal) => sum + goalPercent(goal), 0) / Math.max(goals.length, 1))

  function addGoal(event: FormEvent) {
    event.preventDefault()
    const cleanTitle = title.trim()
    const parsedTarget = Number(target)
    if (!cleanTitle || !Number.isFinite(parsedTarget) || parsedTarget <= 0) return
    create.mutate({ title: cleanTitle, target: parsedTarget, unit, tone: 'indigo' })
    setTitle('')
  }

  function bump(goal: { id: string; current: number; target: number }, delta: number) {
    const next = Math.min(goal.target, Math.max(0, goal.current + delta))
    update.mutate({ id: goal.id, changes: { current: next } })
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Goals & habits"
        title="What you're building"
        description="Update progress as you go. Goal averages shape the dashboard metrics."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{average}%</strong> average progress</span>
          <span className="kpi"><strong>{goals.length}</strong> active goals</span>
        </div>
      </PageHeader>

      <section className="goal-grid">
        {goals.map((goal, index) => {
          const Icon = ICONS[index % ICONS.length]
          const percent = goalPercent(goal)
          const step = goal.unit === '$' ? 20 : 1
          return (
            <article className="card goal-card" key={goal.id}>
              <div className="goal-card-head">
                <span className={`mini-icon goal-${goal.tone}`}><Icon size={18} /></span>
                <button className="icon-ghost" type="button" aria-label={`Delete ${goal.title}`} onClick={() => remove.mutate(goal.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
              <strong>{goal.title}</strong>
              <span className="goal-progress">{goal.unit === '$' ? `$${goal.current} / $${goal.target}` : `${goal.current} / ${goal.target} ${goal.unit}`}</span>
              <div className={`goal-bar ${goal.tone}`}><span style={{ width: `${percent}%` }} /></div>
              <div className="goal-card-foot">
                <small>{percent}% complete</small>
                <div className="stepper">
                  <button type="button" aria-label={`Decrease ${goal.title}`} onClick={() => bump(goal, -step)}>−</button>
                  <button type="button" aria-label={`Increase ${goal.title}`} onClick={() => bump(goal, step)}>+</button>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="card">
        <header className="card-head"><h2>Add a goal</h2><p>New goals start at zero</p></header>
        <form className="inline-form" onSubmit={addGoal}>
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Goal title" aria-label="Goal title" required />
          <input type="number" min="1" value={target} onChange={event => setTarget(event.target.value)} aria-label="Target" />
          <input value={unit} onChange={event => setUnit(event.target.value)} placeholder="Unit (books, km, $)" aria-label="Unit" />
          <button className="btn btn-primary" type="submit"><Plus size={16} /> Add goal</button>
        </form>
      </section>
    </div>
  )
}
