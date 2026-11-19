import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, Command, LogOut, Moon, Search, Star, Sun } from 'lucide-react'
import { useAuth } from '../features/auth/auth-context'
import { useEvents } from '../features/events/useEvents'
import { useTasks } from '../features/tasks/useTasks'
import { useTheme } from '../features/theme/theme-context'
import { NAV_ITEMS } from '../lib/navigation'
import { searchRecords, type SearchHit } from '../lib/search'
import { clockTime, dayOf } from '../lib/dates'
import {
  STORE_KEYS, seedAlerts, seedFiles, seedNotes, seedProfile,
  type Alert, type FileDoc, type Note, type Profile,
} from '../lib/seed'
import { useLocalStore } from '../lib/useLocalStore'

const ALERT_ROUTES: Record<Alert['kind'], string> = {
  task: '/tasks',
  finance: '/finance',
  note: '/notes',
  system: '/automation',
}

function ThemeSwitch() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      className={`switch ${isDark ? 'on' : ''}`}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
    >
      <span />
    </button>
  )
}

function PageFallback() {
  return (
    <div className="page" aria-busy="true">
      <div className="card route-loader">
        <span className="loader-dot" />
        Loading view...
      </div>
    </div>
  )
}

export function AppShell() {
  const { isDark } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile] = useLocalStore<Profile>(STORE_KEYS.profile, seedProfile)
  const { tasks } = useTasks()
  const { events } = useEvents()
  const [notes] = useLocalStore<Note[]>(STORE_KEYS.notes, seedNotes)
  const [files] = useLocalStore<FileDoc[]>(STORE_KEYS.files, seedFiles)
  const [alerts, setAlerts] = useLocalStore<Alert[]>(STORE_KEYS.alerts, seedAlerts)

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const alertsRef = useRef<HTMLDivElement>(null)

  const unread = alerts.filter(alert => !alert.read).length

  const hits = useMemo<SearchHit[]>(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    const pageHits: SearchHit[] = NAV_ITEMS.filter(item => item.label.toLowerCase().includes(term))
      .slice(0, 4)
      .map(item => ({ id: `page-${item.to}`, title: item.label, subtitle: 'Page', to: item.to, group: 'Pages' }))
    const searchEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      place: event.place,
      day: dayOf(event.starts_at),
      start: clockTime(event.starts_at),
    }))
    return [...pageHits, ...searchRecords(term, { tasks, events: searchEvents, notes, files })]
  }, [query, tasks, events, notes, files])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery('')
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setAlertsOpen(false)
        setSearchOpen(true)
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') {
        closeSearch()
        setAlertsOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeSearch])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function goTo(path: string) {
    navigate(path)
    closeSearch()
    searchRef.current?.blur()
  }

  function signOut() {
    logout()
    navigate('/welcome', { replace: true })
  }

  function openAlert(alert: Alert) {
    setAlerts(current => current.map(item => (item.id === alert.id ? { ...item, read: true } : item)))
    setAlertsOpen(false)
    navigate(ALERT_ROUTES[alert.kind])
  }

  function markAllRead() {
    setAlerts(current => current.map(alert => ({ ...alert, read: true })))
  }

  const initials = profile.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Command size={18} /></span>
          <span className="brand-copy"><strong>LifeOS</strong><small>Personal dashboard</small></span>
        </div>

        <nav aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {badge ? <em className="nav-badge">{badge}</em> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isDark ? (
            <div className="upgrade-card">
              <strong>Upgrade to Pro</strong>
              <p>Unlock automation and deeper AI insights.</p>
              <button type="button">Go Premium →</button>
            </div>
          ) : (
            <div className="footer-card">
              <Star size={18} aria-hidden="true" />
              <div>
                <strong>You're on track!</strong>
                <span>Keep going — 68% of this week's goals done.</span>
                <div className="mini-progress"><span style={{ width: '68%' }} /></div>
              </div>
            </div>
          )}
          <div className="theme-row">
            <span className="theme-label">
              {isDark ? <Moon size={15} /> : <Sun size={15} />}
              {isDark ? 'Dark mode' : 'Light mode'}
            </span>
            <div className="theme-actions">
              <ThemeSwitch />
              <small>v1.0.0</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="search-wrap">
            <div className="search">
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchRef}
                aria-label="Search pages and records"
                aria-expanded={searchOpen && Boolean(query)}
                aria-controls="search-results"
                role="combobox"
                aria-autocomplete="list"
                placeholder="Search tasks, notes, files..."
                value={query}
                onChange={event => {
                  setQuery(event.target.value)
                  setHighlight(0)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={event => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setHighlight(current => Math.min(current + 1, hits.length - 1))
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setHighlight(current => Math.max(current - 1, 0))
                  }
                  if (event.key === 'Enter') {
                    const target = hits[highlight] ?? hits[0]
                    if (target) goTo(target.to)
                  }
                }}
              />
              <kbd>⌘ K</kbd>
            </div>
            {searchOpen && query ? (
              <div className="search-results" id="search-results" role="listbox" aria-label="Search results">
                {hits.length ? (
                  hits.map((hit, index) => (
                    <button
                      key={hit.id}
                      type="button"
                      role="option"
                      aria-selected={index === highlight}
                      tabIndex={-1}
                      className={`search-hit ${index === highlight ? 'active' : ''}`}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => goTo(hit.to)}
                    >
                      <span className="search-group">{hit.group}</span>
                      <span className="search-hit-copy">
                        <strong>{hit.title}</strong>
                        <small>{hit.subtitle}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p>Nothing matches “{query}”. Try a task, note or file name.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="topbar-actions">
            <div className="alerts-wrap" ref={alertsRef}>
              <button
                className="icon-btn"
                type="button"
                aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
                aria-expanded={alertsOpen}
                aria-controls="alerts-panel"
                onClick={() => setAlertsOpen(open => !open)}
              >
                <Bell size={19} />
                {unread ? <span className="badge-count">{unread}</span> : null}
              </button>
              {alertsOpen ? (
                <div className="alerts-panel" id="alerts-panel">
                  <div className="alerts-head">
                    <strong>Notifications</strong>
                    <button type="button" onClick={markAllRead} disabled={unread === 0}>Mark all read</button>
                  </div>
                  <div className="alerts-list">
                    {alerts.slice(0, 4).map(alert => (
                      <button
                        key={alert.id}
                        type="button"
                        className={`alert-row ${alert.read ? 'read' : 'unread'}`}
                        onClick={() => openAlert(alert)}
                      >
                        <i className={`alert-dot ${alert.kind}`} />
                        <span>
                          <strong>{alert.title}</strong>
                          <small>{alert.detail} · {alert.time}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                  <Link to="/notifications" onClick={() => setAlertsOpen(false)}>View all notifications</Link>
                </div>
              ) : null}
            </div>

            <div className="profile">
              <div className="avatar">{initials}</div>
              <div className="profile-copy">
                <strong>{profile.name}</strong>
                <span>{profile.role}</span>
              </div>
            </div>

            <button className="icon-btn" type="button" aria-label="Sign out" onClick={signOut}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
