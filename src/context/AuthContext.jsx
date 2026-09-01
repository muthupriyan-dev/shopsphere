import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data || null)
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      loadProfile(session?.user?.id).finally(() => setLoading(false))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user?.id)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { data, error }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const sendPasswordReset = async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`
    return supabase.auth.resetPasswordForEmail(email, { redirectTo })
  }

  const updatePassword = async (newPassword) => {
    return supabase.auth.updateUser({ password: newPassword })
  }

  const refreshProfile = () => loadProfile(user?.id)

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
