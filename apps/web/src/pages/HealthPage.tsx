import { Droplets, Footprints, Heart, Moon, Salad } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, seedHealth, type HealthLog } from '../lib/seed'
import { useLocalStore } from '../lib/useLocalStore'

const TARGETS = { steps: 10000, sleep: 8, water: 2.5 }

export function HealthPage() {
  const [health, setHealth] = useLocalStore<HealthLog>(STORE_KEYS.health, seedHealth)

  function update<K extends keyof HealthLog>(key: K, value: HealthLog[K]) {
    setHealth(current => ({ ...current, [key]: value }))
  }

  const stepPct = Math.min(100, Math.round((health.steps / TARGETS.steps) * 100))
  const sleepPct = Math.min(100, Math.round((health.sleep / TARGETS.sleep) * 100))
  const waterPct = Math.min(100, Math.round((health.water / TARGETS.water) * 100))

  return (
    <div className="page">
      <PageHeader
        eyebrow="Health & fitness"
        title="How today is going"
        description="Log steps, sleep and hydration. The dashboard health widget mirrors this entry."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{stepPct}%</strong> of step goal</span>
          <span className="kpi"><strong>{health.diet ? 'On' : 'Off'}</strong> diet plan</span>
        </div>
      </PageHeader>

      <section className="summary-grid">
        <article className="summary-card">
          <span className="mini-icon grad-pink"><Footprints size={18} /></span>
          <span>Steps</span>
          <strong>{health.steps.toLocaleString()}</strong>
          <div className="track green"><i style={{ width: `${stepPct}%` }} /></div>
          <small>Goal {TARGETS.steps.toLocaleString()} · {stepPct}%</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-indigo"><Moon size={18} /></span>
          <span>Sleep</span>
          <strong>{health.sleep} h</strong>
          <div className="track blue"><i style={{ width: `${sleepPct}%` }} /></div>
          <small>Goal {TARGETS.sleep} h · {sleepPct}%</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-blue"><Droplets size={18} /></span>
          <span>Water</span>
          <strong>{health.water} L</strong>
          <div className="track teal"><i style={{ width: `${waterPct}%` }} /></div>
          <small>Goal {TARGETS.water} L · {waterPct}%</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-green"><Salad size={18} /></span>
          <span>Diet</span>
          <strong>{health.diet ? 'On plan' : 'Off plan'}</strong>
          <small>{health.diet ? '3 balanced meals logged' : 'Log a meal to get back on track'}</small>
        </article>
      </section>

      <section className="card">
        <header className="card-head"><h2>Update today's log</h2><p>Changes save automatically</p></header>
        <div className="health-form">
          <label>
            <span>Steps</span>
            <input type="number" min="0" step="100" value={health.steps} onChange={event => update('steps', Number(event.target.value))} />
          </label>
          <label>
            <span>Sleep (hours)</span>
            <input type="number" min="0" max="14" step="0.1" value={health.sleep} onChange={event => update('sleep', Number(event.target.value))} />
          </label>
          <label>
            <span>Water (litres)</span>
            <input type="number" min="0" max="6" step="0.1" value={health.water} onChange={event => update('water', Number(event.target.value))} />
          </label>
          <label className="inline-check">
            <input type="checkbox" checked={health.diet} onChange={event => update('diet', event.target.checked)} />
            <span>Followed diet plan</span>
          </label>
        </div>
      </section>

      <section className="info-grid">
        <article className="card mini">
          <span className="mini-icon grad-pink"><Heart size={18} /></span>
          <div><strong>Recovery note</strong><p>Sleep has been above 7h all week. Keep the same bedtime tonight.</p></div>
        </article>
        <article className="card mini">
          <span className="mini-icon grad-teal"><Footprints size={18} /></span>
          <div><strong>Move more</strong><p>2,500 steps left to hit today's goal — a 20 minute walk covers it.</p></div>
        </article>
      </section>
    </div>
  )
}
