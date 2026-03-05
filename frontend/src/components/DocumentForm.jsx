import { useEffect, useState } from 'react'

const defaultState = { title: '', description: '', summary: '', summary_embedding: '' }

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40'

const DocumentForm = ({ initialValues, onSubmit, onCancel, onRefreshSummary }) => {
  const [form, setForm] = useState(defaultState)
  const [summaryError, setSummaryError] = useState('')
  const [refreshingSummary, setRefreshingSummary] = useState(false)
  const isEditing = !!initialValues

  useEffect(() => {
    setForm(initialValues ? { ...defaultState, ...initialValues } : defaultState)
    setSummaryError('')
  }, [initialValues])

  const handleRefreshSummary = async () => {
    setSummaryError('')

    if (!form.title.trim() || !form.description.trim()) {
      setSummaryError('Please add a title and description before refreshing the summary.')
      return
    }

    setRefreshingSummary(true)
    try {
      const data = await onRefreshSummary({
        title: form.title,
        description: form.description,
      })
      setForm((prev) => ({ ...prev, summary: data.summary }))
    } catch (err) {
      setSummaryError(err.response?.data?.detail || 'Unable to refresh summary right now.')
    } finally {
      setRefreshingSummary(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      ...(form.summary.trim() ? { summary: form.summary } : {}),
    }
    await onSubmit(payload)
    setForm(defaultState)
    setSummaryError('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">{isEditing ? 'Edit document' : 'Create document'}</h2>
      <div className="mt-4 grid gap-3">
        <input className={inputClass} placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
        <textarea className={inputClass} rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
        <textarea
          className={inputClass}
          rows="3"
          placeholder={isEditing ? 'Summary' : 'Summary (optional - auto-generated if blank)'}
          value={form.summary}
          onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
          required={isEditing}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
            type="button"
            onClick={handleRefreshSummary}
            disabled={refreshingSummary}
          >
            {refreshingSummary ? 'Refreshing...' : 'Refresh summary'}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">Generate summary from your current title + description without saving.</p>
        </div>
        {summaryError && <p className="text-xs text-rose-600 dark:text-rose-300">{summaryError}</p>}
        {!isEditing && <p className="text-xs text-slate-500 dark:text-slate-400">Leave summary blank to auto-generate one using GPT-4o mini.</p>}
        {form.summary_embedding && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vector Embeddings</p>
            <textarea className={inputClass} rows="4" value={form.summary_embedding} readOnly />
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-[0.98]" type="submit">Save</button>
        {onCancel && <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default DocumentForm
