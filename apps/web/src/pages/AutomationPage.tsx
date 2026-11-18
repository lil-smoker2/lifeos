import { useState, type FormEvent } from 'react'
import { Play, Plus, Zap } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, seedActivity, seedRules, type Activity, type Rule } from '../lib/seed'
import { useLocalStore, uid } from '../lib/useLocalStore'

export function AutomationPage() {
  const [rules, setRules] = useLocalStore<Rule[]>(STORE_KEYS.rules, seedRules)
  const [activity, setActivity] = useLocalStore<Activity[]>(STORE_KEYS.activity, seedActivity)
  const [trigger, setTrigger] = useState('')
  const [action, setAction] = useState('')

  const activeCount = rules.filter(rule => rule.active).length

  function runRule(rule: Rule) {
    setRules(current => current.map(item => (item.id === rule.id ? { ...item, runs: item.runs + 1 } : item)))
    setActivity(current => [{ id: uid(), title: `Ran “${rule.trigger} → ${rule.action}”`, time: 'Just now' }, ...current])
  }

  function addRule(event: FormEvent) {
    event.preventDefault()
    const cleanTrigger = trigger.trim()
    const cleanAction = action.trim()
    if (!cleanTrigger || !cleanAction) return
    setRules(current => [...current, { id: uid(), trigger: cleanTrigger, action: cleanAction, active: true, runs: 0 }])
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
                <button className={`switch ${rule.active ? 'on' : ''}`} type="button" role="switch" aria-checked={rule.active} aria-label={`Toggle ${rule.trigger}`} onClick={() => setRules(current => current.map(item => (item.id === rule.id ? { ...item, active: !item.active } : item)))}>
                  <span />
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => runRule(rule)}><Play size={14} /> Run</button>
              </div>
            ))}
          </div>

          <form className="inline-form" onSubmit={addRule}>
            <input value={trigger} onChange={event => setTrigger(event.target.value)} placeholder="Trigger (e.g. task completed)" aria-label="Rule trigger" required />
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
