// ─── 404 — Ruta no encontrada ─────────────────────────────────────────────────
export function notFound(req, res, next) {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

// ─── MANEJADOR GLOBAL DE ERRORES ─────────────────────────────────────────────
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500
  const isProd     = process.env.NODE_ENV === 'production'

  // Registro duplicado en Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Ya existe un registro con ese valor.',
      field: err.meta?.target,
    })
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

  if (!isProd) {
    console.error(`[ERROR] ${err.message}`, err.stack)
  } else {
    console.error(`[ERROR ${statusCode}] ${err.message}`)
  }

  res.status(statusCode).json({
    error: isProd && statusCode === 500
      ? 'Error interno del servidor.'
      : err.message,
    ...(!isProd && { stack: err.stack }),
  })
}
