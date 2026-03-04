import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { findSimilarPublicDocumentsApi, getPublicDocumentApi } from '../api/documents'
import { useEffect } from 'react'

const PublicDocumentDetailPage = () => {
  const { documentId } = useParams()
  const [document, setDocument] = useState(null)
  const [similarDocs, setSimilarDocs] = useState([])
  const [threshold, setThreshold] = useState(60)
  const [loading, setLoading] = useState(true)
  const [similarityLoading, setSimilarityLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getPublicDocumentApi(documentId)
        setDocument(data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load document')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [documentId])

  const normalizedThreshold = useMemo(() => Number((threshold / 100).toFixed(2)), [threshold])

  const handleFindSimilar = async () => {
    setSimilarityLoading(true)
    setError('')
    try {
      const data = await findSimilarPublicDocumentsApi(documentId, normalizedThreshold)
      setSimilarDocs(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to search for similar documents')
    } finally {
      setSimilarityLoading(false)
    }
  }

  return (
    <Layout title={document?.title || 'Document details'} subtitle="View document content and discover related documents by semantic similarity.">
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading document...</p>}

      {document && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">{document.title}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Created on {new Date(document.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Author</span>
                {document.author_name}
              </p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Summary</span>
                {document.summary}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</p>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{document.description}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="similarityThreshold" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Similarity threshold: {threshold}%
                </label>
                <button
                  onClick={handleFindSimilar}
                  disabled={similarityLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {similarityLoading ? 'Searching...' : 'Find Similar Document'}
                </button>
              </div>
              <input
                id="similarityThreshold"
                type="range"
                min="10"
                max="100"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
                className="mt-3 w-full accent-indigo-600"
              />
            </div>
          </section>

          {!!similarDocs.length && (
            <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold">Top Similar Documents</h3>
              <div className="mt-4 grid gap-3">
                {similarDocs.map((similarDoc) => {
                  const scorePercent = (similarDoc.similarity * 100).toFixed(2)
                  const compareUrl = `/compare/${document.id}/${similarDoc.id}?score=${encodeURIComponent(scorePercent)}`

                  return (
                    <div key={similarDoc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div>
                        <Link to={`/documents/${similarDoc.id}`} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                          {similarDoc.title}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400">By {similarDoc.author_name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {scorePercent}%
                        </span>
                        <button
                          onClick={() => window.open(compareUrl, '_blank', 'noopener,noreferrer')}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          Open Comparison
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  )
}

export default PublicDocumentDetailPage
