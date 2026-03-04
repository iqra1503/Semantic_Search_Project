import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { listPublicDocumentsApi } from '../api/documents'

const HomePage = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      try {
        const data = await listPublicDocumentsApi()
        setDocuments(data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load documents')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <Layout title="Discover Documents" subtitle="Browse all shared documents and explore similar content instantly.">
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 shadow-soft dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Public Library</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Explore Shared Documents</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Showing {documents.length} document{documents.length === 1 ? '' : 's'}</p>
        </div>

        {!loading && !documents.length && (
          <p className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No documents are available yet.
          </p>
        )}

        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading documents...</p>}

        {!!documents.length && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <Link
                key={document.id}
                to={`/documents/${document.id}`}
                className="group flex h-full min-h-[210px] flex-col rounded-2xl border border-slate-200/80 bg-white/90 p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-indigo-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">#{document.id}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(document.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-900 transition group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">{document.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{document.description}</p>
                <p className="mt-auto pt-5 text-xs font-medium text-slate-500 dark:text-slate-400">By {document.author_name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

export default HomePage
