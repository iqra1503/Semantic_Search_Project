import { useEffect, useState } from 'react'

const defaultState = { title: '', description: '', summary: '' }

const DocumentForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form, setForm] = useState(defaultState)

  useEffect(() => {
    setForm(initialValues || defaultState)
  }, [initialValues])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(form)
    setForm(defaultState)
  }

  return (
    <form onSubmit={handleSubmit} className="card form-grid">
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        required
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        required
      />
      <textarea
        placeholder="Summary"
        value={form.summary}
        onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
        required
      />
      <div className="actions">
        <button type="submit">Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default DocumentForm
