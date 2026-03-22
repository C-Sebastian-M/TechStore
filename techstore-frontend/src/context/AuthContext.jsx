import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/authService.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [loading,   setLoading]   = useState(true)   // true mientras verifica sesión guardada
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' })

  // ── Al montar: restaurar sesión guardada en localStorage ──────────────────
  useEffect(() => {
    const session = authService.getSavedSession()
    if (session) setUser(session.user)
    setLoading(false)
  }, [])

  // ── Acciones del modal ────────────────────────────────────────────────────
  const openLogin    = () => setAuthModal({ open: true,  tab: 'login'    })
  const openRegister = () => setAuthModal({ open: true,  tab: 'register' })
  const closeAuth    = () => setAuthModal({ open: false, tab: 'login'    })

  // ── Login real ────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { user } = await authService.login(email, password)
    setUser(user)
    closeAuth()
    return user
  }

  // ── Registro real ─────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const { user } = await authService.register(name, email, password)
    setUser(user)
    closeAuth()
    return user
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // ── Actualizar datos del usuario en el estado local ───────────────────────
  const refreshUser = async () => {
    try {
      const updated = await authService.getProfile()
      setUser(updated)
      localStorage.setItem('techstore_user', JSON.stringify(updated))
    } catch {
      // Si falla, el token probablemente expiró — el api.js redirige automáticamente
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
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
