import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import DocumentForm from '../components/DocumentForm'
import { createDocumentApi, deleteDocumentApi, listDocumentsApi, updateDocumentApi } from '../api/documents'

const UserDashboard = () => {
  const [documents, setDocuments] = useState([])
  const [editing, setEditing] = useState(null)

  const loadDocuments = async () => {
    const data = await listDocumentsApi()
    setDocuments(data)
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
    <Layout title="User Dashboard" subtitle="Document Manager">
      <DocumentForm initialValues={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
      <div className="user-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="user-card">
            <h3>{doc.title}</h3>
            <p>{doc.description}</p>
            <small className="muted-text">{doc.summary}</small>
            <div className="row-actions">
              <button className="secondary-button" onClick={() => setEditing(doc)}>Edit</button>
              <button className="danger-button" onClick={() => handleDelete(doc.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export default UserDashboard
