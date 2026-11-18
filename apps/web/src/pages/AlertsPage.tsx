import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, seedAlerts, type Alert } from '../lib/seed'
import { useLocalStore } from '../lib/useLocalStore'

const KIND_LABELS: Record<Alert['kind'], string> = {
  task: 'Tasks',
  finance: 'Finance',
  note: 'Notes',
  system: 'System',
}

export function AlertsPage() {
  const [alerts, setAlerts] = useLocalStore<Alert[]>(STORE_KEYS.alerts, seedAlerts)
  const unread = alerts.filter(alert => !alert.read).length

  return (
    <div className="page">
      <PageHeader
        eyebrow="Notifications"
        title="Your alerts"
        description="Everything that needs attention across tasks, finance, notes and automation."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{unread}</strong> unread</span>
          <span className="kpi"><strong>{alerts.length}</strong> total</span>
        </div>
      </PageHeader>

      <section className="card">
        <div className="list-toolbar">
          <h2 className="section-title">Inbox</h2>
          <button className="btn btn-ghost" type="button" onClick={() => setAlerts(current => current.map(alert => ({ ...alert, read: true })))} disabled={unread === 0}>
            <CheckCheck size={15} /> Mark all read
          </button>
        </div>

        {alerts.length === 0 ? (
          <p className="empty"><Bell size={17} /> No notifications. You are all caught up.</p>
        ) : (
          <ul className="alert-page-list">
            {alerts.map(alert => (
              <li className={`alert-page-row ${alert.read ? 'read' : 'unread'}`} key={alert.id}>
                <i className={`alert-dot ${alert.kind}`} />
                <div className="alert-page-copy">
                  <div>
                    <strong>{alert.title}</strong>
                    <span className="tag">{KIND_LABELS[alert.kind]}</span>
                  </div>
                  <span>{alert.detail} · {alert.time}</span>
                </div>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setAlerts(current => current.map(item => (item.id === alert.id ? { ...item, read: !item.read } : item)))}
                >
                  {alert.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button className="icon-ghost" type="button" aria-label={`Delete ${alert.title}`} onClick={() => setAlerts(current => current.filter(item => item.id !== alert.id))}>
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
