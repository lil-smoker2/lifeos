import { useState, type FormEvent } from 'react'
import { Play, Plus, Zap } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useAutomation } from '../features/automation/useAutomation'

type TriggerKind = 'task_completed' | 'expense_added' | 'study_session'

const TRIGGER_KINDS: { value: TriggerKind; label: string }[] = [
  { value: 'task_completed', label: 'Task completed' },
  { value: 'expense_added', label: 'New expense added' },
  { value: 'study_session', label: 'Study session ended' },
]

export function AutomationPage() {
  const { rules, activity, createRule, updateRule, runRule } = useAutomation()
  const [trigger, setTrigger] = useState('')
  const [triggerKind, setTriggerKind] = useState<TriggerKind>('task_completed')
  const [action, setAction] = useState('')

  const activeCount = rules.filter(rule => rule.active).length

  function addRule(event: FormEvent) {
    event.preventDefault()
    const cleanTrigger = trigger.trim()
    const cleanAction = action.trim()
    if (!cleanTrigger || !cleanAction) return
    createRule.mutate({ trigger: cleanTrigger, trigger_kind: triggerKind, action: cleanAction, active: true })
    setTrigger('')
    setAction('')
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Automation"
        title="Automate the busywork"
        description="When something happens in LifeOS, respond automatically. Runs are logged in recent activity."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{activeCount}</strong> active rules</span>
          <span className="kpi"><strong>{rules.reduce((sum, rule) => sum + rule.runs, 0)}</strong> total runs</span>
        </div>
      </PageHeader>

      <div className="planner-grid">
        <section className="card">
          <header className="card-head"><h2>Your rules</h2><p>Toggle to pause a rule</p></header>
          <div className="rule-list">
            {rules.map(rule => (
              <div className={`rule ${rule.active ? '' : 'paused'}`} key={rule.id}>
                <span className="mini-icon grad-indigo"><Zap size={17} /></span>
                <div className="rule-copy">
                  <strong>When {rule.trigger.toLowerCase()}</strong>
                  <span>Then {rule.action.toLowerCase()} · {rule.runs} runs</span>
                </div>
                <button className={`switch ${rule.active ? 'on' : ''}`} type="button" role="switch" aria-checked={rule.active} aria-label={`Toggle ${rule.trigger}`} onClick={() => updateRule.mutate({ id: rule.id, changes: { active: !rule.active } })}>
                  <span />
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => runRule.mutate(rule.id)}><Play size={14} /> Run</button>
              </div>
            ))}
          </div>

          <form className="inline-form" onSubmit={addRule}>
            <input value={trigger} onChange={event => setTrigger(event.target.value)} placeholder="Trigger (e.g. task completed)" aria-label="Rule trigger" required />
            <select value={triggerKind} onChange={event => setTriggerKind(event.target.value as TriggerKind)} aria-label="Trigger type" required>
              {TRIGGER_KINDS.map(kind => (
                <option key={kind.value} value={kind.value}>{kind.label}</option>
              ))}
            </select>
            <input value={action} onChange={event => setAction(event.target.value)} placeholder="Action (e.g. log activity)" aria-label="Rule action" required />
            <button className="btn btn-primary" type="submit"><Plus size={16} /> Add rule</button>
          </form>
        </section>

        <section className="card">
          <header className="card-head"><h2>Run history</h2><p>Latest first</p></header>
          <div className="activity-list">
            {activity.slice(0, 8).map(item => (
              <div className="activity" key={item.id}>
                <span className="activity-icon"><Zap size={13} /></span>
                <div><strong>{item.title}</strong><span>{item.time}</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
