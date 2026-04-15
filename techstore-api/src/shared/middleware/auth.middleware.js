import jwt    from 'jsonwebtoken'
import prisma from '../../config/prisma.js'

// ─── EXTRAER TOKEN ────────────────────────────────────────────────────────────
// Lee primero la cookie httpOnly (más segura, no accesible desde JS).
// Si no hay cookie, intenta el header Authorization como fallback para
// compatibilidad cross-origin donde la cookie puede no llegar.
function extractToken(req) {
  if (req.cookies?.token) return req.cookies.token
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.split(' ')[1]
  return null
}

// ─── PROTECT — requiere token válido ─────────────────────────────────────────
export async function protect(req, res, next) {
  try {
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ error: 'No autorizado. Token requerido.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado.' })
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Inicia sesión nuevamente.' })
    }
    return res.status(401).json({ error: 'Token inválido.' })
  }
}

// ─── ADMIN ONLY ───────────────────────────────────────────────────────────────
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' })
  }
  next()
}

// ─── OPTIONAL AUTH ────────────────────────────────────────────────────────────
// No falla si no hay token. Adjunta req.user si el token es válido.
// Útil en rutas públicas donde el comportamiento varía según el rol.
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req)
    if (!token) return next()
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (user) req.user = user
  } catch {
    // Token inválido — continuar como anónimo
  }
  next()
}
