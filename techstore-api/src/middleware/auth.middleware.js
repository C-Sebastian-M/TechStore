import jwt    from 'jsonwebtoken'
import prisma from '../config/prisma.js'

// ─── PROTEGER RUTA (requiere token válido) ────────────────────────────────────
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado. Token requerido.' })
    }
    const token   = authHeader.split(' ')[1]
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

// ─── SOLO ADMIN ───────────────────────────────────────────────────────────────
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' })
  }
  next()
}

// ─── AUTH OPCIONAL ────────────────────────────────────────────────────────────
// No falla si no hay token, solo adjunta req.user si el token es válido.
// Útil en rutas públicas donde el comportamiento varía según el rol.
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return next()
    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (user) req.user = user
  } catch {
    // Token inválido o expirado — continuar como anónimo
  }
  next()
}
