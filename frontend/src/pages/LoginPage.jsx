import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin@12345')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const profile = await login(email, password)
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <Layout title="Welcome back" subtitle="Sign in to your workspace">
      <div className="relative grid min-h-[70vh] place-items-center">
        <div className="pointer-events-none absolute inset-x-0 top-14 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />
        <AuthCard
          title="Login"
          subtitle="Access your dashboard"
          error={error}
          footerText="Need an account?"
          footerLinkLabel="Register"
          footerLinkTo="/register"
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <FormField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@company.com" required />
            <FormField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-[0.98]">Sign in</button>
          </form>
        </AuthCard>
      </div>
    </Layout>
  )
}

export default LoginPage
