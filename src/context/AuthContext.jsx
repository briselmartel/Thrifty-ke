import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    if (!userId) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data || null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signUp({ email, password, fullName, role, sellerType }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email,
        role, // 'buyer' | 'seller'
        seller_type: role === 'seller' ? sellerType : null,
        verification_status: role === 'seller' ? 'unverified' : null,
      })
      if (profileError) return { error: profileError }
    }
    return { data }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = { session, user: session?.user || null, profile, loading, signUp, signIn, signOut, refreshProfile: () => loadProfile(session?.user?.id) }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
