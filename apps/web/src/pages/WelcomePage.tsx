import { Link, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../features/auth/auth-context'

export function WelcomePage() {
  const { status } = useAuth()

  if (status === 'authenticated') return <Navigate to="/" replace />

  return (
    <div className="auth-form">
      <p className="eyebrow">Welcome</p>
      <h2>Your day, in one place.</h2>
      <p className="auth-lead">
        Sign in to pick up where you left off, or create an account to start a
        fresh LifeOS workspace.
      </p>

      <div className="auth-actions">
        <Link className="btn btn-primary auth-btn" to="/login">
          Sign in <ArrowRight size={16} />
        </Link>
        <Link className="btn btn-ghost auth-btn" to="/register">Create account</Link>
      </div>

      <ul className="auth-points">
        <li><strong>13 modules</strong><span>Tasks, planner, finance, health and more</span></li>
        <li><strong>Two layouts</strong><span>Light and dark dashboards</span></li>
        <li><strong>Live API</strong><span>JWT-secured accounts on FastAPI</span></li>
      </ul>
    </div>
  )
}
