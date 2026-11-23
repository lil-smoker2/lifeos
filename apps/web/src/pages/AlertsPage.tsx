import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useAlerts } from '../features/alerts/useAlerts'
import type { ApiAlert } from '../services/api'

const KIND_LABELS: Record<ApiAlert['kind'], string> = {
  task: 'Tasks',
  finance: 'Finance',
  note: 'Notes',
  system: 'System',
}

export function AlertsPage() {
  const { alerts, unread, update, readAll, remove } = useAlerts()

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
          <button className="btn btn-ghost" type="button" onClick={() => readAll.mutate()} disabled={unread === 0}>
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
                  onClick={() => update.mutate({ id: alert.id, read: !alert.read })}
                >
                  {alert.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button className="icon-ghost" type="button" aria-label={`Delete ${alert.title}`} onClick={() => remove.mutate(alert.id)}>
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
