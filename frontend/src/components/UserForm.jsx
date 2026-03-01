import { useEffect, useState } from 'react'

const defaultState = { name: '', email: '', role: 'user', password: '' }

const UserForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form, setForm] = useState(defaultState)

  useEffect(() => {
    setForm(initialValues ? { ...initialValues, password: '' } : defaultState)
  }, [initialValues])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.password) {
      delete payload.password
    }
    await onSubmit(payload)
    if (!initialValues) setForm(defaultState)
  }

  return (
    <form onSubmit={handleSubmit} className="card form-grid">
      <input placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
      <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
      <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <input
        placeholder={initialValues ? 'New Password (optional)' : 'Password'}
        type="password"
        value={form.password}
        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        required={!initialValues}
      />
      <div className="actions">
        <button type="submit">Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default UserForm
