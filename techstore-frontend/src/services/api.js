// ─── URL BASE ─────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '')

// ─── CLIENTE HTTP CENTRAL ─────────────────────────────────────────────────────
// El token JWT viaja en una cookie httpOnly gestionada automáticamente
// por el navegador — no necesitamos leerlo ni adjuntarlo manualmente.
// credentials: 'include' es obligatorio para que el navegador envíe la cookie
// en peticiones cross-origin (frontend en Vercel → API en Vercel).

async function request(endpoint, options = {}) {
  const config = {
    credentials: 'include',           // envía la cookie httpOnly en cada petición
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  // Token expirado o inválido → limpiar sesión local y redirigir
  if (response.status === 401) {
    localStorage.removeItem('techstore_user')
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
