import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { listUsersApi } from '../api/users'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  const loadUsers = async () => {
    setError('')
    try {
      const data = await listUsersApi()
      setUsers(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load users')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <Layout title="Admin Dashboard" subtitle="User Directory">
      {error && <p className="error-banner">{error}</p>}
      <section className="panel">
        <div className="panel-header-row">
          <h2>Registered Users</h2>
          <button className="secondary-button" onClick={loadUsers}>Refresh</button>
        </div>
        <div className="user-grid">
          {users.map((item) => (
            <article key={item.id} className="user-card">
              <h3>{item.name}</h3>
              <p>{item.email}</p>
              <span className="role-chip">{item.role}</span>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  )
}

export default AdminDashboard
