// ─── URL BASE ─────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '')

// ─── CLIENTE HTTP CENTRAL ─────────────────────────────────────────────────────
// Estrategia dual de autenticación:
// 1. Cookie httpOnly (preferida, más segura contra XSS)
// 2. Authorization header como fallback (para casos donde la cookie
//    no llega en cross-origin — ej. usuarios de Google en Vercel)

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('techstore_token')

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // Fallback: si hay token en localStorage, también lo enviamos en el header
      // El middleware del backend acepta ambos (cookie tiene prioridad)
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  // Token expirado o inválido → limpiar sesión local y redirigir
  if (response.status === 401) {
    localStorage.removeItem('techstore_user')
    localStorage.removeItem('techstore_token')
    window.location.href = '/'
    return
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error   = new Error(data?.error || `Error ${response.status}`)
    error.status  = response.status
    error.details = data?.details
    throw error
  }

  return data
}

// ─── MÉTODOS PÚBLICOS ─────────────────────────────────────────────────────────
export const api = {
  get:    (endpoint)       => request(endpoint, { method: 'GET' }),
  post:   (endpoint, body) => request(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body) => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (endpoint, body) => request(endpoint, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (endpoint)       => request(endpoint, { method: 'DELETE' }),
}

export default api
