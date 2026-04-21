import { AppError } from '../errors/AppError.js'

// ─── 404 — Ruta no encontrada ─────────────────────────────────────────────────
export function notFound(req, res, next) {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404))
}

// ─── MANEJADOR GLOBAL DE ERRORES ─────────────────────────────────────────────
export function errorHandler(err, req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production'

  // AppError: error de dominio con statusCode intencional
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Registro duplicado en Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor.', field: err.meta?.target })
  }

  // Registro no encontrado en Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso no encontrado.' })
  }

  // Error de validación Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error:   'Datos inválidos.',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }

  // Error inesperado
  const statusCode = err.statusCode || 500
  if (!isProd) console.error(`[ERROR] ${err.message}`, err.stack)
  else         console.error(`[ERROR ${statusCode}] ${err.message}`)

  res.status(statusCode).json({
    error: isProd && statusCode === 500 ? 'Error interno del servidor.' : err.message,
    ...(!isProd && { stack: err.stack }),
  })
}
