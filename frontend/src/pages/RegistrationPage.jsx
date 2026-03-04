import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../api/auth'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import Layout from '../components/Layout'

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
    <Layout title="Create account" subtitle="Registration is for new users only">
      <div className="relative grid min-h-[70vh] place-items-center">
        <div className="pointer-events-none absolute inset-x-0 top-14 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-400/10" />
        <AuthCard
          title="Register"
          subtitle="Start using Document Manager"
          error={error}
          footerText="Already registered?"
          footerLinkLabel="Sign in"
          footerLinkTo="/login"
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <FormField label="Name" value={form.name} onChange={updateField('name')} type="text" placeholder="Jane Doe" required />
            <FormField label="Email" value={form.email} onChange={updateField('email')} type="email" placeholder="name@email.com" required />
            <FormField label="Password" value={form.password} onChange={updateField('password')} type="password" placeholder="At least 8 characters" minLength={8} required />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-[0.98]">Register</button>
          </form>
        </AuthCard>
      </div>
    </Layout>
  )
}

export default RegistrationPage
