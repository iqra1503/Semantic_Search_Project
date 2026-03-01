import api from './axios'

export const listDocumentsApi = async () => {
  const { data } = await api.get('/documents')
  return data
}

export const createDocumentApi = async (payload) => {
  const { data } = await api.post('/documents', payload)
  return data
}

export const updateDocumentApi = async (id, payload) => {
  const { data } = await api.put(`/documents/${id}`, payload)
  return data
}

export const deleteDocumentApi = async (id) => {
  await api.delete(`/documents/${id}`)
}
