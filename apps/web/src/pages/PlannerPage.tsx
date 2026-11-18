import { useState, type FormEvent } from 'react'
import { CalendarDays, Clock3, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, seedEvents, type EventItem } from '../lib/seed'
import { useLocalStore, uid } from '../lib/useLocalStore'

const YEAR = 2026
const MONTH = 10
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TONES: EventItem['tone'][] = ['blue', 'violet', 'orange', 'green']
const TODAY = new Date()
const TODAY_IN_VIEW = TODAY.getFullYear() === YEAR && TODAY.getMonth() === MONTH

export function PlannerPage() {
  const [events, setEvents] = useLocalStore<EventItem[]>(STORE_KEYS.events, seedEvents)
  const initialDay = TODAY_IN_VIEW ? TODAY.getDate() : 18
  const [selectedDay, setSelectedDay] = useState(initialDay)
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [start, setStart] = useState('09:00')
  const [tone, setTone] = useState<EventItem['tone']>('blue')

  const firstWeekday = new Date(YEAR, MONTH, 1).getDay()
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthEvents = events.filter(event => event.day >= 1 && event.day <= daysInMonth)
  const selectedEvents = monthEvents.filter(event => event.day === selectedDay).sort((a, b) => a.start.localeCompare(b.start))

  function addEvent(event: FormEvent) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    setEvents(current => [...current, { id: uid(), title: cleanTitle, place: place.trim() || 'Campus', day: selectedDay, start, tone }])
    setTitle('')
    setPlace('')
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Planner"
        title="Calendar & schedule"
        description="November 2026 — tap a day to review or add events. Today's timeline feeds the dashboard."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{monthEvents.length}</strong> events in November</span>
          <span className="kpi"><strong>{selectedEvents.length}</strong> on Nov {selectedDay}</span>
        </div>
      </PageHeader>

      <div className="planner-grid">
        <section className="card calendar-card">
          <header className="card-head"><h2>November 2026</h2><CalendarDays size={18} aria-hidden="true" /></header>
          <div className="calendar-weekdays" aria-hidden="true">
            {WEEKDAYS.map(day => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid" role="grid" aria-label="November 2026 calendar">
            {cells.map((day, index) => {
              if (day === null) return <span key={`empty-${index}`} className="calendar-day empty" aria-hidden="true" />
              const count = monthEvents.filter(event => event.day === day).length
              return (
                <button
                  key={day}
                  type="button"
                  role="gridcell"
                  aria-label={`November ${day}${count ? `, ${count} events` : ''}`}
                  aria-selected={selectedDay === day}
                  className={`calendar-day ${selectedDay === day ? 'selected' : ''} ${day === initialDay ? 'today' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                  {count ? <i>{count}</i> : null}
                </button>
              )
            })}
          </div>
        </section>

        <section className="card">
          <header className="card-head">
            <div><h2>Nov {selectedDay} timeline</h2><p>{selectedEvents.length} scheduled</p></div>
          </header>
          <div className="timeline">
            {selectedEvents.map(event => (
              <div className="timeline-row" key={event.id}>
                <time>{event.start}</time>
                <i className={`dot ${event.tone}`} />
                <div className="timeline-copy">
                  <strong>{event.title}</strong>
                  <span>{event.place}</span>
                </div>
                <button
                  className="icon-ghost"
                  type="button"
                  aria-label={`Delete ${event.title}`}
                  onClick={() => setEvents(current => current.filter(item => item.id !== event.id))}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {selectedEvents.length === 0 ? <p className="empty"><Clock3 size={16} /> No events yet. Add one below.</p> : null}
          </div>

          <form className="stack-form" onSubmit={addEvent}>
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Event title" aria-label="Event title" required />
            <input value={place} onChange={event => setPlace(event.target.value)} placeholder="Location" aria-label="Location" />
            <div className="form-row">
              <input type="time" value={start} onChange={event => setStart(event.target.value)} aria-label="Start time" />
              <select value={tone} onChange={event => setTone(event.target.value as EventItem['tone'])} aria-label="Color">
                {TONES.map(option => <option key={option}>{option}</option>)}
              </select>
              <button className="btn btn-primary" type="submit"><Plus size={16} /> Add event</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
