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
    <form onSubmit={handleSubmit} className="panel form-stack">
      <h2>{initialValues ? 'Update document' : 'Create document'}</h2>
      <input
        className="field-input"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        required
      />
      <textarea
        className="field-input"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        required
      />
      <textarea
        className="field-input"
        placeholder="Summary"
        value={form.summary}
        onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
        required
      />
      <div className="row-actions">
        <button className="primary-button" type="submit">Save</button>
        {onCancel && <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default DocumentForm
