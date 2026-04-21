// ─── AuthMiddleware — S + D ───────────────────────────────────────────────────
// S: una sola responsabilidad — verificar identidad en cada petición.
// D: depende de TokenService (abstracción), no de jsonwebtoken directamente.

import prisma            from '../../config/prisma.js'
import { TokenService }  from '../utils/TokenService.js'
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js'

// Lee el token desde la cookie httpOnly (preferido) o el header Authorization (fallback).
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
    if (!token) return next(new UnauthorizedError('Token requerido.'))

    const decoded = TokenService.verify(token)
    const user    = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (!user) return next(new UnauthorizedError('Usuario no encontrado.'))

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expirado. Inicia sesión nuevamente.'))
    }
    next(new UnauthorizedError('Token inválido.'))
  }
}

// ─── ADMIN ONLY ───────────────────────────────────────────────────────────────
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return next(new ForbiddenError('Acceso restringido a administradores.'))
  }
  next()
}

// ─── OPTIONAL AUTH ────────────────────────────────────────────────────────────
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req)
    if (!token) return next()
    const decoded = TokenService.verify(token)
    const user    = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (user) req.user = user
  } catch { /* token inválido — continuar como anónimo */ }
  next()
}
