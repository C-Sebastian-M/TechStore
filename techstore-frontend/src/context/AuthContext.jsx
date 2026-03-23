import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/authService.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' })

  useEffect(() => {
    const session = authService.getSavedSession()
    if (session) setUser(session.user)
    setLoading(false)
  }, [])

  const openLogin    = () => setAuthModal({ open: true,  tab: 'login'    })
  const openRegister = () => setAuthModal({ open: true,  tab: 'register' })
  const closeAuth    = () => setAuthModal({ open: false, tab: 'login'    })

  // Paso 1: enviar código de verificación
  const register = async (name, email, password, recaptchaToken) => {
    return authService.register(name, email, password, recaptchaToken)
  }

  // Paso 2: verificar código y crear cuenta
  const verifyEmail = async (email, code) => {
    const { user } = await authService.verifyEmail(email, code)
    setUser(user)
    closeAuth()
    return user
  }

  const login = async (email, password) => {
    const { user } = await authService.login(email, password)
    setUser(user)
    closeAuth()
    return user
  }

  const loginWithGoogle = async (credential) => {
    const { user } = await authService.loginWithGoogle(credential)
    setUser(user)
    closeAuth()
    return user
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const updated = await authService.getProfile()
      setUser(updated)
      localStorage.setItem('techstore_user', JSON.stringify(updated))
    } catch { /* token expirado */ }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      authModal,
      openLogin,
      openRegister,
      closeAuth,
      login,
      register,
      verifyEmail,
      loginWithGoogle,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
