import api from './axios'

export const listDocumentsApi = async () => {
  const { data } = await api.get('/documents')
  return data
}

export const createDocumentApi = async (payload) => {
  if (payload.file) {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('description', payload.description || '')
    if (payload.summary) {
      formData.append('summary', payload.summary)
    }
    formData.append('file', payload.file)

    const { data } = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  }

  const { data } = await api.post('/documents', payload)
  return data
}

export const updateDocumentApi = async (id, payload) => {
  if (payload.file) {
    const formData = new FormData()
    if (payload.title !== undefined) {
      formData.append('title', payload.title)
    }
    if (payload.description !== undefined) {
      formData.append('description', payload.description || '')
    }
    if (payload.summary !== undefined) {
      formData.append('summary', payload.summary)
    }
    formData.append('file', payload.file)

    const { data } = await api.put(`/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  }

  const { data } = await api.put(`/documents/${id}`, payload)
  return data
}

export const deleteDocumentApi = async (id) => {
  await api.delete(`/documents/${id}`)
}


export const previewDocumentSummaryApi = async (payload) => {
  const { data } = await api.post('/documents/summary-preview', payload)
  return data
}

export const listPublicDocumentsApi = async () => {
  const { data } = await api.get('/documents/public')
  return data
}

export const getPublicDocumentApi = async (id) => {
  const { data } = await api.get(`/documents/public/${id}`)
  return data
}

export const findSimilarPublicDocumentsApi = async (id, minSimilarity = 0.5) => {
  const { data } = await api.get(`/documents/public/${id}/similar`, {
    params: {
      min_similarity: minSimilarity,
      limit: 5
    }
  })
  return data
}
