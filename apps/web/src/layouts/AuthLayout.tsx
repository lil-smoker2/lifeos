import { Link, Outlet } from 'react-router-dom'
import { Command, Moon, Sun } from 'lucide-react'
import { useTheme } from '../features/theme/theme-context'

export function AuthLayout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <Link to="/welcome" className="auth-logo">
          <span className="brand-mark"><Command size={18} /></span>
          <span>LifeOS</span>
        </Link>

        <div className="auth-brand-copy">
          <p className="eyebrow">Personal dashboard</p>
          <h1>Run your day from one calm place.</h1>
          <p>
            Tasks, planner, money, study, health and notes — connected, themed,
            and ready whenever you are.
          </p>
          <ul>
            <li>One dashboard for every part of student life</li>
            <li>Light and dark layouts that remember your choice</li>
            <li>Search, alerts and an assistant across all your data</li>
          </ul>
        </div>

        <blockquote>
          “Small steps every day build the life you want.”
          <span>— LifeOS</span>
        </blockquote>
      </aside>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <button className="auth-theme" type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
        <div className="auth-card">
          <Outlet />
        </div>
        <p className="auth-foot">LifeOS v1.0.0 · your data stays on this device</p>
      </section>
    </div>
  )
}
