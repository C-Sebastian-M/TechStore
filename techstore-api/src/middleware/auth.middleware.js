import jwt    from 'jsonwebtoken'
import prisma from '../config/prisma.js'

// ─── EXTRAER TOKEN ────────────────────────────────────────────────────────────
// Lee el token desde la cookie httpOnly (preferido) o del header Authorization.
// La cookie es más segura (no accesible desde JS), el header mantiene compatibilidad.
function extractToken(req) {
  if (req.cookies?.token) return req.cookies.token
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.split(' ')[1]
  return null
}

// ─── PROTEGER RUTA (requiere token válido) ────────────────────────────────────
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

// ─── SOLO ADMIN ───────────────────────────────────────────────────────────────
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' })
  }
  next()
}

// ─── AUTH OPCIONAL ────────────────────────────────────────────────────────────
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
