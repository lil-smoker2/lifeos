import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../features/auth/auth-context'
import { ApiError } from '../services/api'

export function RegisterPage() {
  const { status, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

  if (status === 'authenticated' && !recoveryCodes && !busy) return <Navigate to="/" replace />

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
      const result = await register(name, password)
      setRecoveryCodes(result.recoveryCodes)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to create the account right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-form">
      {recoveryCodes ? (
        <>
          <p className="eyebrow">Save these now</p>
          <h2>Your recovery codes</h2>
          <p className="auth-lead">Each code works once to reset your password. Store them somewhere private; they cannot be viewed again.</p>
          <ol className="recovery-code-list">
            {recoveryCodes.map(code => <li key={code}>{code.match(/.{1,8}/g)?.join('-')}</li>)}
          </ol>
          <p className="form-error recovery-warning">Anyone with one of these codes can reset your password.</p>
          <button className="btn btn-primary auth-btn" type="button" onClick={() => navigate('/', { replace: true })}>
            Continue to LifeOS
          </button>
        </>
      ) : (
      <>
      <p className="eyebrow">Create account</p>
      <h2>Start your LifeOS</h2>
      <p className="auth-lead">No email needed — just pick a name and password.</p>

      <form className="auth-fields" onSubmit={submit}>
        <label className="field"><span>Name</span>
          <input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required />
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
      </>
      )}
    </div>
  )
}
