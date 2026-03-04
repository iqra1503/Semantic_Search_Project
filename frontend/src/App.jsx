import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import { RoleRoute } from './routes/RoleRoute'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import PublicDocumentDetailPage from './pages/PublicDocumentDetailPage'
import DocumentComparisonPage from './pages/DocumentComparisonPage'

function App() {
  const { user } = useAuth()
  const dashboardPath = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={dashboardPath} replace /> : <HomePage />} />
      <Route path="/documents/:documentId" element={<PublicDocumentDetailPage />} />
      <Route path="/compare/:sourceId/:targetId" element={<DocumentComparisonPage />} />
      <Route path="/login" element={user ? <Navigate to={dashboardPath} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={dashboardPath} replace /> : <RegistrationPage />} />
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
      <Route path="*" element={<Navigate to={dashboardPath} replace />} />
    </Routes>
  )
}

export default App
