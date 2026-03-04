import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { getPublicDocumentApi } from '../api/documents'

const ComparisonCard = ({ label, document }) => (
  <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{document.title}</h2>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">By {document.author_name}</p>
    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{document.description}</p>
    <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">{document.summary}</p>
  </article>
)

const DocumentComparisonPage = () => {
  const { sourceId, targetId } = useParams()
  const [searchParams] = useSearchParams()
  const [sourceDocument, setSourceDocument] = useState(null)
  const [targetDocument, setTargetDocument] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      try {
        const [source, target] = await Promise.all([getPublicDocumentApi(sourceId), getPublicDocumentApi(targetId)])
        setSourceDocument(source)
        setTargetDocument(target)
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load comparison documents')
      }
    }

    load()
  }, [sourceId, targetId])

  const score = searchParams.get('score') || '0'

  return (
    <Layout title="Document Comparison" subtitle="Compare both full documents and review their semantic match score.">
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
        Similarity score: <strong>{score}%</strong>
      </div>

      {!sourceDocument && !targetDocument && !error && <p className="text-sm text-slate-500 dark:text-slate-400">Loading comparison...</p>}

      {(sourceDocument || targetDocument) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {sourceDocument && <ComparisonCard label="Selected Document" document={sourceDocument} />}
          {targetDocument && <ComparisonCard label="Matching Document" document={targetDocument} />}
        </div>
      )}

      <Link to={`/documents/${sourceId}`} className="mt-5 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
        Back to selected document
      </Link>
    </Layout>
  )
}

export default DocumentComparisonPage
