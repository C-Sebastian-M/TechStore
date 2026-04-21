// ─── TokenService — S: una sola responsabilidad: generar y verificar JWT ────────
// D: los servicios de negocio dependen de este contrato, no de jsonwebtoken directamente.
// Para cambiar de JWT a otro sistema basta con modificar este archivo.

import jwt from 'jsonwebtoken'

export const TokenService = {
  generate(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    )
  },

  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
  },

  // Setea el token como cookie httpOnly — el navegador la gestiona automáticamente.
  // La cookie viaja en cada petición sin que JS pueda leerla (protección XSS).
  setCookie(res, token) {
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('token', token, {
      httpOnly: true,
      secure:   isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge:   24 * 60 * 60 * 1000,
      path:     '/',
    })
  },

  clearCookie(res) {
    const isProd = process.env.NODE_ENV === 'production'
    res.clearCookie('token', {
      httpOnly: true,
      secure:   isProd,
      sameSite: isProd ? 'none' : 'lax',
      path:     '/',
    })
  },
}
