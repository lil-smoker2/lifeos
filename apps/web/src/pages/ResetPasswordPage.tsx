import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { ApiError, api } from '../services/api'

export function ResetPasswordPage() {
  const [name, setName] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await api.resetPassword(name, recoveryCode, password)
      setComplete(true)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to reset the password right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-form">
      {complete ? (
        <>
          <p className="eyebrow">Password updated</p>
          <h2>You can sign in</h2>
          <p className="auth-lead">That recovery code can no longer be used. Sign in with your new password.</p>
          <Link className="btn btn-primary auth-btn" to="/login">Back to sign in</Link>
        </>
      ) : (
        <>
          <p className="eyebrow">Account recovery</p>
          <h2>Reset your password</h2>
          <p className="auth-lead">Enter your name and one unused recovery code saved when you created your account.</p>
          <form className="auth-fields" onSubmit={submit}>
            <label className="field"><span>Name</span>
              <input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required />
            </label>
            <label className="field"><span>Recovery code</span>
              <input value={recoveryCode} onChange={event => setRecoveryCode(event.target.value)} autoComplete="off" maxLength={40} required />
            </label>
            <label className="field"><span>New password</span>
              <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
            </label>
            <label className="field"><span>Confirm new password</span>
              <input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" minLength={8} required />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="btn btn-primary auth-btn" type="submit" disabled={busy}>
              <KeyRound size={16} /> {busy ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
          <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
        </>
      )}
    </div>
  )
}
