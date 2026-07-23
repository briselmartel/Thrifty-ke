import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SELLER_TYPES } from '../lib/constants'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('buyer')
  const [sellerType, setSellerType] = useState('individual')
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      role,
      sellerType,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl mb-2">Create your account</h1>
      <p className="opacity-70 text-sm mb-8">Join Kenya's escrow-protected marketplace.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {['buyer', 'seller'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`py-3 rounded-xl border text-sm capitalize transition-colors ${role === r ? 'border-[var(--color-gold)]' : 'border-white/15 opacity-70'}`}
            style={role === r ? { background: 'var(--color-ink-3)' } : {}}
          >
            I'm a {r}
          </button>
        ))}
      </div>

      {role === 'seller' && (
        <div className="mb-6">
          <label className="block text-sm mb-2 opacity-80">What kind of seller are you?</label>
          <div className="space-y-2">
            {SELLER_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${sellerType === t.value ? 'border-[var(--color-gold)]' : 'border-white/15'}`}
              >
                <input
                  type="radio"
                  name="sellerType"
                  value={t.value}
                  checked={sellerType === t.value}
                  onChange={() => setSellerType(t.value)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="block text-xs opacity-60">{t.hint}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs opacity-50 mt-2">
            Thrift stores get a dedicated shop badge and can list bulk clothing collections.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 opacity-80">Full name</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
          />
        </div>
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm opacity-70 mt-6 text-center">
        Already have an account? <Link to="/login" className="underline" style={{ color: 'var(--color-gold)' }}>Log in</Link>
      </p>
    </div>
  )
}
