import { useEffect, useMemo, useState } from 'react'
import { createDocumentApi, listDocumentsApi, previewDocumentSummaryApi, updateDocumentApi, deleteDocumentApi } from '../api/documents'
import { listUsersApi } from '../api/users'
import DocumentForm from '../components/DocumentForm'
import Layout from '../components/Layout'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [documents, setDocuments] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const userMap = useMemo(() => Object.fromEntries(users.map((item) => [item.id, item])), [users])

  const loadData = async () => {
    setError('')
    try {
      const [userData, documentData] = await Promise.all([listUsersApi(), listDocumentsApi()])
      setUsers(userData)
      setDocuments(documentData)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load admin data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (payload) => {
    if (editing) {
      await updateDocumentApi(editing.id, payload)
      setEditing(null)
    } else {
      await createDocumentApi(payload)
    }
    await loadData()
  }

  const handleDelete = async (id) => {
    await deleteDocumentApi(id)
    await loadData()
  }

  return (
    <Layout
      title="Admin Dashboard"
      subtitle="User and document oversight"
      sidebarItems={[{ to: '/admin', label: 'Admin Overview' }]}
    >
      <DocumentForm initialValues={editing} onSubmit={handleSubmit} onCancel={editing ? () => setEditing(null) : null} onRefreshSummary={previewDocumentSummaryApi} />
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Registered users</h2>
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={loadData}>Refresh</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {users.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-700">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.email}</p>
                <span className="mt-2 inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium capitalize text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">{item.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">All documents</h2>
          <div className="mt-4 grid gap-3">
            {documents.map((doc) => (
              <article key={doc.id} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{doc.description}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Owner: {userMap[doc.created_by]?.name || 'Unknown'} ({userMap[doc.created_by]?.email || `ID ${doc.created_by}`})</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Source: <span className="font-medium capitalize">{doc.source_type}</span>{doc.file_name ? ` (${doc.file_name})` : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setEditing(doc)}>Edit</button>
                    <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white transition hover:bg-rose-500 active:scale-[0.98]" onClick={() => handleDelete(doc.id)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default AdminDashboard
