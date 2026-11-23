import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../features/auth/auth-context'
import { ApiError } from '../services/api'

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (status === 'authenticated') return <Navigate to={from} replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(name, password)
      navigate(from, { replace: true })
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to sign in right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-form">
      <p className="eyebrow">Sign in</p>
      <h2>Welcome back</h2>
      <p className="auth-lead">Use your name and password to open LifeOS.</p>

      <form className="auth-fields" onSubmit={submit}>
        <label className="field"><span>Name</span>
          <input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required />
        </label>
        <label className="field"><span>Password</span>
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="btn btn-primary auth-btn" type="submit" disabled={busy}>
          <LogIn size={16} /> {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        New to LifeOS? <Link to="/register">Create an account</Link>
      </p>
      <p className="auth-switch">
        Forgot your password? <Link to="/reset-password">Use a recovery code</Link>
      </p>
    </div>
  )
}
