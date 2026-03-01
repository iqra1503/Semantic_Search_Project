import api from './axios'

export const loginApi = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const getMeApi = async () => {
  const { data } = await api.get('/auth/me')
  return data
}
