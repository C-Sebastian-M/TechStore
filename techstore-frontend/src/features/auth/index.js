// ─── Feature: auth — punto de entrada público ─────────────────────────────────
// Importa todo lo de auth desde aquí en lugar de rutas largas.
// Ejemplo: import { useAuth, AuthProvider } from '@/features/auth'

export * from './context/AuthContext.jsx'
export * from './services/authService.js'
export { default as AuthModal } from './components/AuthModal.jsx'
