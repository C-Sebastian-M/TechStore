import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/authService.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' })

  // ── Restaurar sesión al montar ────────────────────────────────────────────
  useEffect(() => {
    const session = authService.getSavedSession()
    if (session) setUser(session.user)
    setLoading(false)
  }, [])

  // ── Acciones del modal ────────────────────────────────────────────────────
  const openLogin    = () => setAuthModal({ open: true,  tab: 'login'    })
  const openRegister = () => setAuthModal({ open: true,  tab: 'register' })
  const closeAuth    = () => setAuthModal({ open: false, tab: 'login'    })

  // ── Login con email/password ──────────────────────────────────────────────
  const login = async (email, password) => {
    const { user } = await authService.login(email, password)
    setUser(user)
    closeAuth()
    return user
  }

  // ── Registro con email/password + reCAPTCHA ───────────────────────────────
  const register = async (name, email, password, recaptchaToken) => {
    const { user } = await authService.register(name, email, password, recaptchaToken)
    setUser(user)
    closeAuth()
    return user
  }

  // ── Login con Google OAuth ────────────────────────────────────────────────
  const loginWithGoogle = async (credential) => {
    const { user } = await authService.loginWithGoogle(credential)
    setUser(user)
    closeAuth()
    return user
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // ── Refrescar datos del usuario ───────────────────────────────────────────
  const refreshUser = async () => {
    try {
      const updated = await authService.getProfile()
      setUser(updated)
      localStorage.setItem('techstore_user', JSON.stringify(updated))
    } catch {
      // Token expirado — api.js redirige automáticamente
    }
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
      loginWithGoogle,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
