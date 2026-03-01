import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = ({ title, children }) => {
  const { user, logout } = useAuth()

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>{title}</h1>
          <p>{user?.name} ({user?.role})</p>
        </div>
        <nav className="nav">
          {user?.role === 'admin' ? <Link to="/admin">Documents</Link> : <Link to="/dashboard">Documents</Link>}
          {user?.role === 'admin' && <Link to="/admin/users">Users</Link>}
          <button onClick={logout}>Logout</button>
        </nav>
      </header>
      {children}
    </div>
  )
}

export default Layout
