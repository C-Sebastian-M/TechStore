import api from './api.js'

// ─── CONTACTO ─────────────────────────────────────────────────────────────────

/**
 * Envía un mensaje de contacto al backend.
 * El endpoint POST /contact debe existir en el API.
 * Si no existe aún, el error se propagará al formulario con un mensaje claro.
 *
 * @param {{ name: string, email: string, topic: string, message: string }} data
 */
export async function sendContactMessage(data) {
  return api.post('/contact', data)
}
