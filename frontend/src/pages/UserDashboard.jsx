import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import DocumentForm from '../components/DocumentForm'
import { createDocumentApi, deleteDocumentApi, listDocumentsApi, previewDocumentSummaryApi, updateDocumentApi } from '../api/documents'

const UserDashboard = () => {
  const [documents, setDocuments] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const loadDocuments = async () => {
    setError('')
    try {
      const data = await listDocumentsApi()
      setDocuments(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load documents')
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleSubmit = async (payload) => {
    if (editing) {
      await updateDocumentApi(editing.id, payload)
      setEditing(null)
    } else {
      await createDocumentApi(payload)
    }
    await loadDocuments()
  }

  const handleDelete = async (id) => {
    await deleteDocumentApi(id)
    await loadDocuments()
  }

  return (
    <Layout title="User Dashboard" subtitle="Manage your own documents" sidebarItems={[{ to: '/dashboard', label: 'My Documents' }]}>
      <DocumentForm initialValues={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} onRefreshSummary={previewDocumentSummaryApi} />
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My documents</h2>
          <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={loadDocuments}>Refresh</button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <article key={doc.id} className="rounded-xl border border-slate-200 p-4 transition duration-200 hover:-translate-y-1 hover:shadow-soft dark:border-slate-700">
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{doc.description}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{doc.summary}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Source: <span className="font-medium capitalize">{doc.source_type}</span>{doc.file_name ? ` (${doc.file_name})` : ''}</p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setEditing(doc)}>Edit</button>
                <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white transition hover:bg-rose-500 active:scale-[0.98]" onClick={() => handleDelete(doc.id)}>Delete</button>
              </div>
            </article>
          ))}
          {!documents.length && <p className="text-sm text-slate-500 dark:text-slate-400">No documents found. Create your first one above.</p>}
        </div>
      </section>
    </Layout>
  )
}

export default UserDashboard
