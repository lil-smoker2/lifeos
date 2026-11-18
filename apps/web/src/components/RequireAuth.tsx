import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'

export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="boot-screen" role="status" aria-live="polite">
        <span className="loader-dot" />
        Loading LifeOS...
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/welcome" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
