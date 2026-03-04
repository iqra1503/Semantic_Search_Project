import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import { RoleRoute } from './routes/RoleRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()
  const homePath = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={homePath} replace /> : <RegistrationPage />} />
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RoleRoute allowedRoles={['user']}>
            <UserDashboard />
          </RoleRoute>
        }
      />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  )
}

export default App
