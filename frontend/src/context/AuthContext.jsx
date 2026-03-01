import { createContext, useContext, useEffect, useState } from 'react'
import { getMeApi, loginApi } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const bootstrap = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const profile = await getMeApi()
      setUser(profile)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bootstrap()
  }, [])

  const login = async (email, password) => {
    const tokenPayload = await loginApi(email, password)
    localStorage.setItem('token', tokenPayload.access_token)
    const profile = await getMeApi()
    setUser(profile)
    return profile
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
