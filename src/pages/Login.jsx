import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(form)
    setLoading(false)
    if (error) { setError(error.message || 'Could not log in. Please check your email and password.'); return }
    navigate('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20">
      <h1 className="font-display text-3xl mb-2">Welcome back</h1>
      <p className="opacity-70 text-sm mb-8">Log in to your Thrifty account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 opacity-80">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 opacity-80">Password</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
          />
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--color-terracotta)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full font-medium disabled:opacity-50"
          style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
        >
          {loading ? 'Logging inâ€¦' : 'Log in'}
        </button>
      </form>

      <p className="text-sm opacity-70 mt-6 text-center">
        New to Thrifty? <Link to="/signup" className="underline" style={{ color: 'var(--color-gold)' }}>Create an account</Link>
      </p>
    </div>
  )
}