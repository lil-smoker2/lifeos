import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Bot, CalendarDays, CheckCircle2, ChevronRight,
  CircleDollarSign, Clock3, CloudSun, Command, Flame, FolderOpen, GraduationCap,
  Heart, Laptop, MoreHorizontal, Plus, Send, Target, Trophy, WalletCards,
} from 'lucide-react'
import { DonutRing } from '../components/DonutRing'
import { useTheme } from '../features/theme/ThemeProvider'
import {
  STORE_KEYS, balanceOf, goalPercent, learningPercent, money, seedActivity,
  seedCourses, seedEvents, seedGoals, seedHealth, seedProfile, seedReminders,
  seedTasks, seedTxns, type Activity, type Course, type EventItem, type Goal,
  type HealthLog, type Profile, type Reminder, type Task, type Txn,
} from '../lib/seed'
import { useLocalStore } from '../lib/useLocalStore'

const quickTiles = [
  { label: 'Study', detail: '4 courses', to: '/learning', tone: 'grad-blue', icon: GraduationCap },
  { label: 'Tasks', detail: 'Due today', to: '/tasks', tone: 'grad-green', icon: CheckCircle2 },
  { label: 'Calendar', detail: 'Next 24h', to: '/planner', tone: 'grad-orange', icon: CalendarDays },
  { label: 'Finance', detail: 'This month', to: '/finance', tone: 'grad-teal', icon: WalletCards },
  { label: 'Health', detail: 'Daily log', to: '/health', tone: 'grad-pink', icon: Heart },
  { label: 'Goals', detail: 'Monthly', to: '/goals', tone: 'grad-purple', icon: Target },
  { label: 'AI Assistant', detail: 'Ask anything', to: '/ai', tone: 'grad-indigo', icon: Bot },
  { label: 'More', detail: 'All modules', to: '/help', tone: 'grad-lime', icon: Command },
]

function Sparkline() {
  const points = [18, 26, 22, 34, 30, 40, 36, 46, 42, 54, 48, 58]
  const path = points.map((value, index) => `${index * 32},${70 - value}`).join(' ')
  return (
    <svg className="sparkline" viewBox="0 0 352 80" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22B052" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22B052" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,80 L${path.replaceAll(' ', ' L')} L352,80 Z`} fill="url(#spark-fill)" />
      <polyline points={path} fill="none" stroke="#22B052" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

export function Dashboard() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [tasks, setTasks] = useLocalStore<Task[]>(STORE_KEYS.tasks, seedTasks)
  const [events] = useLocalStore<EventItem[]>(STORE_KEYS.events, seedEvents)
  const [txns] = useLocalStore<Txn[]>(STORE_KEYS.txns, seedTxns)
  const [courses] = useLocalStore<Course[]>(STORE_KEYS.courses, seedCourses)
  const [goals] = useLocalStore<Goal[]>(STORE_KEYS.goals, seedGoals)
  const [health] = useLocalStore<HealthLog>(STORE_KEYS.health, seedHealth)
  const [reminders, setReminders] = useLocalStore<Reminder[]>(STORE_KEYS.reminders, seedReminders)
  const [activity] = useLocalStore<Activity[]>(STORE_KEYS.activity, seedActivity)
  const [profile] = useLocalStore<Profile>(STORE_KEYS.profile, seedProfile)
  const [prompt, setPrompt] = useState(profile.focus)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const openTasks = tasks.filter(task => !task.done)
  const todayEvents = events.filter(event => event.day === new Date().getDate())
  const balance = balanceOf(txns)
  const learning = learningPercent(courses)
  const goalsAverage = Math.round(goals.reduce((sum, goal) => sum + goalPercent(goal), 0) / Math.max(goals.length, 1))
  const firstName = profile.name.split(' ')[0]
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const clock = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateLine = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  function toggleTask(id: string) {
    setTasks(current => current.map(task => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  function askAssistant(event: FormEvent) {
    event.preventDefault()
    navigate('/ai', { state: { prompt } })
  }

  return (
    <div className="dashboard">
      <section className={`hero ${isDark ? 'hero-dark' : 'hero-light'}`}>
        <svg className="hero-art" viewBox="0 0 600 220" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
          <circle cx="470" cy="66" r="38" fill="#FFE7B0" opacity="0.85" />
          <path d="M0 220 L170 110 L300 220 Z" fill="#0B2C63" opacity="0.35" />
          <path d="M180 220 L360 86 L560 220 Z" fill="#0B2C63" opacity="0.28" />
          <path d="M360 220 L500 140 L620 220 Z" fill="#071A3A" opacity="0.32" />
        </svg>
        <div className="hero-scrim" />
        <div className="hero-copy">
          <p className="eyebrow">{dateLine}</p>
          <h1>
            {greeting}, {isDark ? <em>{firstName}!</em> : `${firstName}!`} <span aria-hidden="true">👋</span>
          </h1>
          <p>{isDark ? '“Small steps every day build the life you want.” — LifeOS' : 'Make today count. Small steps create great results.'}</p>
        </div>
        <div className="hero-side">
          {isDark ? (
            <div className="hero-quote">
              <span>Focus of the day</span>
              <strong>Deep work before noon</strong>
            </div>
          ) : (
            <>
              <CloudSun size={34} aria-hidden="true" />
              <div><strong>24°</strong><span>Sunny · Campus</span></div>
              <div className="hero-clock"><strong>{clock}</strong><span>{dateLine}</span></div>
            </>
          )}
        </div>
      </section>

      {isDark ? (
        <>
          <section className="quick-grid" aria-label="Quick actions">
            {quickTiles.map(({ label, detail, to, tone, icon: Icon }) => (
              <Link key={label} to={to} className={`quick-tile ${tone}`}>
                <span className="quick-icon"><Icon size={20} /></span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </Link>
            ))}
          </section>

          <section className="matrix" aria-label="Dashboard widgets">
            <article className="card schedule-card">
              <header className="card-head"><h2>Calendar &amp; schedule</h2><Link to="/planner">Open</Link></header>
              <div className="schedule-body">
                <div className="date-chip"><strong>18</strong><span>Nov</span><small>Wed</small></div>
                <div className="timeline">
                  {todayEvents.slice(0, 3).map(event => (
                    <div className="timeline-row" key={event.id}>
                      <time>{event.start}</time>
                      <i className={`dot ${event.tone}`} />
                      <div><strong>{event.title}</strong><span>{event.place}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="card">
              <header className="card-head"><h2>My tasks</h2><Link to="/tasks">View all</Link></header>
              <div className="task-list">
                {openTasks.slice(0, 3).map(task => (
                  <div className="task-row" key={task.id}>
                    <button className="check" type="button" aria-label={`Complete ${task.title}`} onClick={() => toggleTask(task.id)} />
                    <div className="task-name"><strong>{task.title}</strong><span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span></div>
                    <span className="task-time"><Clock3 size={13} />{task.due}</span>
                  </div>
                ))}
                <Link className="add-task" to="/tasks"><Plus size={14} /> Add task</Link>
              </div>
            </article>

            <article className="card">
              <header className="card-head"><h2>Learning progress</h2><Link to="/learning">Details</Link></header>
              <div className="learning-body">
                <DonutRing percent={learning} color="#2DD4BF" size={104} />
                <div className="subject-bars">
                  {courses.map(course => (
                    <div key={course.id} className="subject-bar">
                      <span>{course.name}</span>
                      <div className={`track ${course.tone}`}><i style={{ width: `${Math.round((course.done / course.total) * 100)}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="card">
              <header className="card-head"><h2>Finance tracker</h2><span className="trend">↑ +12%</span></header>
              <div className="finance-value"><strong>{money(balance, true)}</strong><span>This month</span></div>
              <Sparkline />
              <div className="legend">
                <span><i className="key income" /> Income</span>
                <span><i className="key expense" /> Expenses</span>
                <span><i className="key savings" /> Savings</span>
              </div>
            </article>

            <article className="card">
              <header className="card-head"><h2>My goals</h2><Link to="/goals">Manage</Link></header>
              <div className="goal-list">
                {goals.map((goal, index) => {
                  const Icon = [Trophy, Laptop, Flame][index % 3]
                  return (
                    <div className="goal" key={goal.id}>
                      <div><span><Icon size={13} /> {goal.title}</span><strong>{goalPercent(goal)}%</strong></div>
                      <div className={`goal-bar ${goal.tone}`}><span style={{ width: `${goalPercent(goal)}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="card health-card">
              <header className="card-head"><h2>Health &amp; wellness</h2><Link to="/health">Log</Link></header>
              <div className="health-head">
                <span className="health-icon"><Heart size={20} /></span>
                <div><strong>{health.steps.toLocaleString()}</strong><span>steps today</span></div>
              </div>
              <div className="track green"><i style={{ width: `${Math.min(100, (health.steps / 10000) * 100)}%` }} /></div>
              <div className="health-metrics">
                <div><span>Sleep</span><strong>{health.sleep} h</strong></div>
                <div><span>Water</span><strong>{health.water} L</strong></div>
                <div><span>Diet</span><strong>{health.diet ? 'On plan' : 'Off plan'}</strong></div>
              </div>
            </article>

            <article className="card">
              <header className="card-head"><h2>Quick access</h2></header>
              <div className="chip-grid">
                {[
                  ['YouTube', 'https://youtube.com'],
                  ['Gmail', 'https://mail.google.com'],
                  ['Google', 'https://google.com'],
                  ['ChatGPT', 'https://chat.openai.com'],
                ].map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className="chip"><ArrowUpRight size={13} />{label}</a>
                ))}
                <Link className="chip" to="/files"><FolderOpen size={13} />Files</Link>
                <Link className="chip" to="/health"><Heart size={13} />Health</Link>
                <Link className="chip" to="/settings"><Command size={13} />Settings</Link>
                <Link className="chip" to="/goals"><Target size={13} />Goals</Link>
              </div>
            </article>

            <article className="card">
              <header className="card-head"><h2>Reminders</h2><Link to="/planner">All</Link></header>
              <div className="reminder-list">
                {reminders.map(reminder => (
                  <div className={`reminder ${reminder.done ? 'done' : ''}`} key={reminder.id}>
                    <i className={`badge ${reminder.badge}`} />
                    <div><strong>{reminder.title}</strong><span>{reminder.time}</span></div>
                    <button
                      className="radio"
                      type="button"
                      aria-label={`Mark ${reminder.title} done`}
                      onClick={() => setReminders(current => current.map(item => (item.id === reminder.id ? { ...item, done: !item.done } : item)))}
                    />
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <header className="card-head"><h2>Recent activity</h2></header>
              <div className="activity-list">
                {activity.slice(0, 4).map(item => (
                  <div className="activity" key={item.id}>
                    <span className="activity-icon"><CheckCircle2 size={14} /></span>
                    <div><strong>{item.title}</strong><span>{item.time}</span></div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : (
        <>
          <section className="stat-grid" aria-label="Key metrics">
            <article className="stat-card grad-green">
              <span className="glass-badge"><CheckCircle2 size={20} /></span>
              <strong>{openTasks.length}</strong>
              <span>Tasks</span>
              <small>{openTasks.filter(task => task.priority === 'High').length} high priority</small>
            </article>
            <article className="stat-card grad-blue">
              <span className="glass-badge"><CalendarDays size={20} /></span>
              <strong>{todayEvents.length}</strong>
              <span>Events</span>
              <small>{todayEvents[0] ? `Next at ${todayEvents[0].start}` : 'Nothing scheduled'}</small>
            </article>
            <article className="stat-card grad-orange">
              <span className="glass-badge"><CircleDollarSign size={20} /></span>
              <strong>{money(balance, false)}</strong>
              <span>Finance</span>
              <small>↑ 12% this month</small>
            </article>
            <article className="stat-card grad-purple">
              <span className="glass-badge"><GraduationCap size={20} /></span>
              <strong>{courses.length}</strong>
              <span>Courses</span>
              <small>{courses.filter(course => course.done < course.total).length} in progress</small>
            </article>
            <article className="stat-card grad-teal">
              <span className="glass-badge"><Target size={20} /></span>
              <strong>{goalsAverage}%</strong>
              <span>Goals</span>
              <small>On track</small>
            </article>
          </section>

          <section className="widget-row" aria-label="Today at a glance">
            <article className="card tasks-card">
              <header className="card-head">
                <div><h2>Today's tasks</h2><p>{dateLine}</p></div>
                <Link to="/tasks">View all</Link>
              </header>
              <div className="task-list">
                {tasks.slice(0, 4).map(task => (
                  <div className={`task-row ${task.done ? 'done' : ''}`} key={task.id}>
                    <button
                      className={`check ${task.done ? 'checked' : ''}`}
                      type="button"
                      aria-label={task.done ? `Reopen ${task.title}` : `Complete ${task.title}`}
                      onClick={() => toggleTask(task.id)}
                    />
                    <div className="task-name"><strong>{task.title}</strong><span className={`pill ${task.priority.toLowerCase()}`}>{task.category}</span></div>
                    <span className="task-time"><Clock3 size={13} />{task.due}</span>
                  </div>
                ))}
                <Link className="add-task" to="/tasks"><Plus size={14} /> Add task</Link>
              </div>
            </article>

            <article className="card">
              <header className="card-head">
                <div><h2>Upcoming events</h2><p>Next 24 hours</p></div>
                <MoreHorizontal size={18} aria-hidden="true" />
              </header>
              <div className="event-list">
                {todayEvents.map(event => (
                  <div className="event" key={event.id}>
                    <span className={`event-icon ${event.tone}`}><CalendarDays size={17} /></span>
                    <div><strong>{event.title}</strong><span>{event.start} · {event.place}</span></div>
                    <ChevronRight size={16} className="chev" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <header className="card-head">
                <div><h2>Finance overview</h2><p>{money(balance, false)} this month</p></div>
                <span className="trend">↑ 12%</span>
              </header>
              <div className="bar-chart" aria-label="Monthly finance chart">
                {[42, 58, 46, 72, 64, 82, 68, 88, 76, 92, 84, 96].map((height, index) => (
                  <div key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="chart-labels"><span>Nov 1</span><span>Nov 18</span><span>Nov 30</span></div>
              <Link className="text-link" to="/finance">View details <ArrowRight size={14} /></Link>
            </article>
          </section>

          <section className="widget-row" aria-label="Progress and assistant">
            <article className="card">
              <header className="card-head"><div><h2>Learning progress</h2><p>Weekly study goal</p></div><Link to="/learning">Details</Link></header>
              <div className="learning-body">
                <DonutRing percent={learning} color="#0EAE50" size={112} />
                <div className="learning-stats">
                  <div><span>Study time</span><strong>18h 20m</strong></div>
                  <div><span>Lessons</span><strong>{courses.reduce((sum, c) => sum + c.done, 0)} / {courses.reduce((sum, c) => sum + c.total, 0)}</strong></div>
                  <div className="track green"><i style={{ width: `${learning}%` }} /></div>
                </div>
              </div>
            </article>

            <article className="card">
              <header className="card-head"><div><h2>Your goals</h2><p>Monthly overview</p></div><Link to="/goals">Add goal</Link></header>
              <div className="goal-list">
                {goals.map((goal, index) => {
                  const Icon = [Trophy, Laptop, Flame][index % 3]
                  return (
                    <div className="goal" key={goal.id}>
                      <div><span><Icon size={13} /> {goal.title}</span><strong>{goalPercent(goal)}%</strong></div>
                      <div className={`goal-bar ${goal.tone}`}><span style={{ width: `${goalPercent(goal)}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="ai-card">
              <div className="ai-head">
                <span className="ai-orb"><Bot size={26} /></span>
                <div><strong>AI Assistant</strong><span>Ask LifeOS anything</span></div>
              </div>
              <form onSubmit={askAssistant} className="ai-form">
                <input
                  aria-label="Ask the AI assistant"
                  value={prompt}
                  onChange={event => setPrompt(event.target.value)}
                  placeholder="Plan my study schedule..."
                />
                <button type="submit" aria-label="Send prompt"><Send size={16} /></button>
              </form>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
