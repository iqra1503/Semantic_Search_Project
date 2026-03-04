import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500 dark:text-slate-400">Loading...</div>
  }

  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}
