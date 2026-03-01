import api from './axios'

export const listUsersApi = async () => {
  const { data } = await api.get('/users')
  return data
}

export const createUserApi = async (payload) => {
  const { data } = await api.post('/users', payload)
  return data
}

export const updateUserApi = async (id, payload) => {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}
