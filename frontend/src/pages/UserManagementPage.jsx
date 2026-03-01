import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import UserForm from '../components/UserForm'
import { createUserApi, listUsersApi, updateUserApi } from '../api/users'

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [editing, setEditing] = useState(null)

  const loadUsers = async () => {
    const data = await listUsersApi()
    setUsers(data)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSubmit = async (payload) => {
    if (editing) {
      await updateUserApi(editing.id, payload)
      setEditing(null)
    } else {
      await createUserApi(payload)
    }
    await loadUsers()
  }

  return (
    <Layout title="User Management">
      <UserForm initialValues={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
      <div className="list">
        {users.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.email}</p>
            <p>Role: {item.role}</p>
            <button onClick={() => setEditing(item)}>Edit</button>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export default UserManagementPage
