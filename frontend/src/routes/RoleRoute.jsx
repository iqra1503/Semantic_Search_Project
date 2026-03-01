import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="container">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}
