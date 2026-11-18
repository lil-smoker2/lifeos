import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../features/auth/auth-context'
import { ApiError } from '../services/api'

export function RegisterPage() {
  const { status, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (status === 'authenticated') return <Navigate to="/" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await register(name, email, password)
      navigate('/', { replace: true })
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to create the account right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-form">
      <p className="eyebrow">Create account</p>
      <h2>Start your LifeOS</h2>
      <p className="auth-lead">One account keeps your modules and preferences together.</p>

      <form className="auth-fields" onSubmit={submit}>
        <label className="field"><span>Name</span>
          <input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required />
        </label>
        <label className="field"><span>Email</span>
          <input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
        </label>
        <label className="field"><span>Password</span>
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
        </label>
        <label className="field"><span>Confirm password</span>
          <input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" minLength={8} required />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="btn btn-primary auth-btn" type="submit" disabled={busy}>
          <UserPlus size={16} /> {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  )
}
