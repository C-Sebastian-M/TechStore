// ─── URL BASE ─────────────────────────────────────────────────────────────────
// En desarrollo apunta al backend local.
// En producción cambia esta variable en el .env del frontend.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ─── HELPER PARA OBTENER EL TOKEN ─────────────────────────────────────────────
const getToken = () => localStorage.getItem('techstore_token')

// ─── CLIENTE HTTP CENTRAL ─────────────────────────────────────────────────────
// Todos los fetch de la app pasan por aquí.
// Ventajas:
//   - Adjunta el token JWT automáticamente en peticiones protegidas
//   - Maneja errores HTTP de forma centralizada
//   - Un solo lugar para cambiar la URL base

async function request(endpoint, options = {}) {
  const token = getToken()

  const config = {
    headers: {
      'Content-Type': 'application/json',
      // Si hay token, lo adjunta. Si no, el header no se envía.
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  // Si el token expiró o es inválido → limpiar sesión y recargar
  if (response.status === 401) {
    localStorage.removeItem('techstore_token')
    localStorage.removeItem('techstore_user')
    window.location.href = '/'
    return
  }

  // Intentar parsear como JSON siempre
  const data = await response.json().catch(() => null)

  // Si la respuesta no es 2xx, lanzar el error con el mensaje del backend
  if (!response.ok) {
    const error = new Error(data?.error || `Error ${response.status}`)
    error.status  = response.status
    error.details = data?.details   // Para errores de validación Zod
    throw error
  }

  return data
}

// ─── MÉTODOS PÚBLICOS ─────────────────────────────────────────────────────────
export const api = {
  get:    (endpoint)              => request(endpoint, { method: 'GET' }),
  post:   (endpoint, body)        => request(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body)        => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (endpoint, body)        => request(endpoint, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (endpoint)              => request(endpoint, { method: 'DELETE' }),
}

export default api
