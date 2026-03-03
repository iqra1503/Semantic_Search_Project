import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{subtitle || 'Workspace'}</p>
          <h1>{title}</h1>
          <p className="muted-text">{user?.name} ({user?.role})</p>
        </div>
        <nav className="nav-actions">
          {user?.role === 'user' && <Link to="/dashboard" className="secondary-button">My Documents</Link>}
          <button onClick={handleLogout} className="primary-button">Logout</button>
        </nav>
      </header>
      {children}
    </div>
  )
}

export default Layout
