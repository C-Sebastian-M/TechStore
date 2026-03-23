import api from './api.js'

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Registrar usuario nuevo → devuelve { user, token }
export async function register(name, email, password, recaptchaToken) {
  const data = await api.post('/auth/register', { name, email, password, recaptchaToken })
  // Guardar token y usuario en localStorage para persistencia
  localStorage.setItem('techstore_token', data.token)
  localStorage.setItem('techstore_user',  JSON.stringify(data.user))
  return data
}

// Iniciar sesión → devuelve { user, token }
export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password })
  localStorage.setItem('techstore_token', data.token)
  localStorage.setItem('techstore_user',  JSON.stringify(data.user))
  return data
}

// Login con Google OAuth → devuelve { user, token }
export async function loginWithGoogle(credential) {
  const data = await api.post('/auth/google', { credential })
  localStorage.setItem('techstore_token', data.token)
  localStorage.setItem('techstore_user',  JSON.stringify(data.user))
  return data
}

// Cerrar sesión → limpia localStorage
export function logout() {
  localStorage.removeItem('techstore_token')
  localStorage.removeItem('techstore_user')
}

// Obtener sesión guardada (para restaurar al recargar la página)
export function getSavedSession() {
  try {
    const token = localStorage.getItem('techstore_token')
    const user  = JSON.parse(localStorage.getItem('techstore_user') || 'null')
    if (token && user) return { token, user }
    return null
  } catch {
    return null
  }
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────

// Obtener perfil completo del usuario autenticado (incluye direcciones)
export async function getProfile() {
  return api.get('/auth/me')
}

// Actualizar nombre, teléfono, fecha de nacimiento
export async function updateProfile(data) {
  const updated = await api.put('/auth/me', data)
  // Actualizar caché local también
  localStorage.setItem('techstore_user', JSON.stringify(updated))
  return updated
}

// Cambiar contraseña
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
