import { useEffect, useState } from 'react'

const defaultState = { title: '', description: '', summary: '', summary_embedding: '' }
const supportedExtensions = ['.txt', '.pdf', '.docx']

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40'

const DocumentForm = ({ initialValues, onSubmit, onCancel, onRefreshSummary }) => {
  const [form, setForm] = useState(defaultState)
  const [summaryError, setSummaryError] = useState('')
  const [refreshingSummary, setRefreshingSummary] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const isEditing = !!initialValues

  useEffect(() => {
    setForm(initialValues ? { ...defaultState, ...initialValues } : defaultState)
    setSummaryError('')
    setSelectedFile(null)
    setFileError('')
  }, [initialValues])

  const validateAndSetFile = (file) => {
    if (!file) {
      setSelectedFile(null)
      setFileError('')
      return
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
    if (!supportedExtensions.includes(extension)) {
      setSelectedFile(null)
      setFileError('Unsupported file type. Please upload .txt, .pdf, or .docx files.')
      return
    }

    setSelectedFile(file)
    setFileError('')
    setForm((prev) => ({ ...prev, description: '' }))
  }

  const handleRefreshSummary = async () => {
    if (!onRefreshSummary) return
    setSummaryError('')

    const sourceDescription = selectedFile ? '' : form.description
    if (!form.title.trim() || !sourceDescription.trim()) {
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
      ...(selectedFile ? { file: selectedFile } : {}),
    }

    await onSubmit(payload)
    setForm(defaultState)
    setSummaryError('')
    setSelectedFile(null)
    setFileError('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">{isEditing ? 'Edit document' : 'Create document'}</h2>
      <div className="mt-4 grid gap-3">
        <input className={inputClass} placeholder="Document title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
        <textarea className={inputClass} rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required={!selectedFile} disabled={!!selectedFile} />

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{isEditing ? 'Upload a replacement file' : 'OR upload a file'}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Supported: .txt, .pdf, .docx</p>
          <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500">
            Browse File
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              className="hidden"
              onChange={(e) => validateAndSetFile(e.target.files?.[0])}
            />
          </label>
          {selectedFile && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">Selected: {selectedFile.name}</p>}
          {fileError && <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{fileError}</p>}
        </div>

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
            disabled={!onRefreshSummary || refreshingSummary || !!selectedFile}
          >
            {refreshingSummary ? 'Refreshing...' : 'Refresh summary'}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">Generate summary from your current title + description without saving.</p>
        </div>
        {summaryError && <p className="text-xs text-rose-600 dark:text-rose-300">{summaryError}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">You can type a description or upload a supported document file.</p>
        {form.summary_embedding && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vector Embeddings</p>
            <textarea className={inputClass} rows="4" value={form.summary_embedding} readOnly />
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-[0.98]" type="submit">Save Document</button>
        {onCancel && <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default DocumentForm
