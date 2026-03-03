import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../api/auth'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'

const RegistrationPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await registerApi(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start using document management"
      error={error}
      footerText="Already registered?"
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        <FormField label="Name" value={form.name} onChange={updateField('name')} type="text" placeholder="Jane Doe" required />
        <FormField label="Email" value={form.email} onChange={updateField('email')} type="email" placeholder="name@email.com" required />
        <FormField label="Password" value={form.password} onChange={updateField('password')} type="password" placeholder="At least 8 characters" minLength={8} required />
        <button type="submit" className="primary-button">Register</button>
      </form>
    </AuthCard>
  )
}

export default RegistrationPage
