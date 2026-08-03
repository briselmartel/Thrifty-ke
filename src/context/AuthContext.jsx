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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            seller_type: role === 'seller' ? sellerType : null,
          },
        },
      })
      if (error) {
        console.error('Signup error:', error)
        return { error: { message: error.message || error.error_description || error.msg || 'Could not create your account. Please try again in a moment.' } }
      }

      // The profile row is created automatically by a database trigger
      // (see supabase/schema.sql - handle_new_user), so it works even
      // before the user confirms their email and has an active session.
      // needsConfirmation is true when email confirmation is required
      // and the user isn't logged in yet (no session returned).
      return { data, needsConfirmation: !data.session }
    } catch (err) {
      console.error('Unexpected signup error:', err)
      return { error: { message: err?.message || 'Something went wrong. Please check your internet connection and try again.' } }
    }
  }

  async function signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Login error:', error)
        return { data, error: { message: error.message || 'Could not log in. Please check your email and password.' } }
      }
      return { data, error }
    } catch (err) {
      console.error('Unexpected login error:', err)
      return { error: { message: err?.message || 'Something went wrong. Please check your internet connection and try again.' } }
    }
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