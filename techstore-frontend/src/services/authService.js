import api from './api.js'

// ─── AUTH ─────────────────────────────────────────────────────────────────────
// El token JWT viaja en una cookie httpOnly — el navegador la gestiona
// automáticamente. Solo guardamos el objeto `user` en localStorage
// para restaurar la sesión al recargar sin hacer una petición extra.

// Registrar usuario nuevo — Paso 1: envía código de verificación al email
export async function register(name, email, password, recaptchaToken) {
  return api.post('/auth/register', { name, email, password, recaptchaToken })
}

// Paso 2: verificar código y crear cuenta
export async function verifyEmail(email, code) {
  const data = await api.post('/auth/verify-email', { email, code })
  // Guardamos solo el user — el token queda en cookie httpOnly
  localStorage.setItem('techstore_user', JSON.stringify(data.user))
  return data
}

// Iniciar sesión
export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password })
  localStorage.setItem('techstore_user', JSON.stringify(data.user))
  return data
}

// Login con Google OAuth
export async function loginWithGoogle(credential) {
  const data = await api.post('/auth/google', { credential })
  localStorage.setItem('techstore_user', JSON.stringify(data.user))
  return data
}

// Cerrar sesión — llama al backend para limpiar la cookie + limpia localStorage
export async function logout() {
  try {
    await api.post('/auth/logout', {})
  } catch { /* si falla, igual limpiamos local */ }
  localStorage.removeItem('techstore_user')
}

// Obtener sesión guardada (para restaurar al recargar)
export function getSavedSession() {
  try {
    const user = JSON.parse(localStorage.getItem('techstore_user') || 'null')
    if (user) return { user }
    return null
  } catch {
    return null
  }
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────

export async function getProfile() {
  return api.get('/auth/me')
}

export async function updateProfile(data) {
  const updated = await api.put('/auth/me', data)
  localStorage.setItem('techstore_user', JSON.stringify(updated))
  return updated
}

export async function changePassword(currentPassword, newPassword) {
  return api.put('/auth/me/password', { currentPassword, newPassword })
}

// ─── DIRECCIONES ──────────────────────────────────────────────────────────────

export async function addAddress(data) {
  return api.post('/auth/me/addresses', data)
}

export async function updateAddress(id, data) {
  return api.put(`/auth/me/addresses/${id}`, data)
}

export async function deleteAddress(id) {
  return api.delete(`/auth/me/addresses/${id}`)
}
