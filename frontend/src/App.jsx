import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import UserManagementPage from './pages/UserManagementPage'
import { RoleRoute } from './routes/RoleRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <UserManagementPage />
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
      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />} />
    </Routes>
  )
}

export default App
