import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
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
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue"
      error={error}
      footerText="Need an account?"
      footerLinkLabel="Register"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        <FormField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@email.com" required />
        <FormField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
        <button type="submit" className="primary-button">Sign In</button>
      </form>
    </AuthCard>
  )
}

export default LoginPage
