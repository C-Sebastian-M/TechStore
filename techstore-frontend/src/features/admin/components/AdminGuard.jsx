import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'

// ─── AdminGuard ───────────────────────────────────────────────────────────────
// Protege rutas del panel de administración.
// Redirige a "/" si el usuario no existe o no tiene rol ADMIN.

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}
