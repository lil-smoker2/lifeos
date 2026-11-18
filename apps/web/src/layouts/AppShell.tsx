import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell, BookOpen, Bot, CalendarDays, Command, FolderOpen, GraduationCap,
  Heart, HelpCircle, LayoutDashboard, Moon, Search, Settings, Star, Sun,
  Target, WalletCards, Zap,
} from 'lucide-react'
import { useTheme } from '../features/theme/ThemeProvider'
import { STORE_KEYS, seedProfile, type Profile } from '../lib/seed'
import { useLocalStore } from '../lib/useLocalStore'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
  { to: '/learning', label: 'Study & Learning', icon: GraduationCap },
  { to: '/finance', label: 'Finance', icon: WalletCards },
  { to: '/health', label: 'Health & Fitness', icon: Heart },
  { to: '/notes', label: 'Notes & Knowledge', icon: BookOpen },
  { to: '/files', label: 'Files & Documents', icon: FolderOpen },
  { to: '/goals', label: 'Goals & Habits', icon: Target },
  { to: '/ai', label: 'AI Assistant', icon: Bot, badge: 'New' },
  { to: '/automation', label: 'Automation', icon: Zap },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
]

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

export function AppShell() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [profile] = useLocalStore<Profile>(STORE_KEYS.profile, seedProfile)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return NAV_ITEMS.filter(item => item.label.toLowerCase().includes(term)).slice(0, 5)
  }, [query])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function goTo(path: string) {
    navigate(path)
    setQuery('')
    setSearchOpen(false)
    searchRef.current?.blur()
  }

  const initials = profile.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="app-shell">
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

      <main className="main">
        <header className="topbar">
          <div className="search-wrap">
            <div className="search">
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchRef}
                aria-label="Search pages"
                placeholder="Search anything..."
                value={query}
                onChange={event => {
                  setQuery(event.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && matches[0]) goTo(matches[0].to)
                }}
              />
              <kbd>⌘ K</kbd>
            </div>
            {searchOpen && query ? (
              <div className="search-results" role="listbox" aria-label="Search results">
                {matches.length ? (
                  matches.map(item => (
                    <button key={item.to} type="button" role="option" aria-selected="false" onClick={() => goTo(item.to)}>
                      <item.icon size={16} aria-hidden="true" />
                      {item.label}
                    </button>
                  ))
                ) : (
                  <p>No pages match “{query}”.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" type="button" aria-label="Notifications, 3 unread">
              <Bell size={19} />
              <span className="badge-count">3</span>
            </button>
            <div className="profile">
              <div className="avatar">{initials}</div>
              <div className="profile-copy">
                <strong>{profile.name}</strong>
                <span>{profile.role}</span>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
