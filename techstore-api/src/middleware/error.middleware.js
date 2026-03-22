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

  // Error de validación de Prisma (registro duplicado)
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Ya existe un registro con ese valor.',
      field: err.meta?.target,
    })
  }

  // Error de Prisma: registro no encontrado
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

  // En desarrollo: loguear con stack trace completo
  if (!isProd) {
    console.error(`[ERROR] ${err.message}`, err.stack)
  } else {
    // En producción: loguear solo el mensaje, sin stack trace
    // (el stack trace revela rutas internas y estructura del servidor)
    console.error(`[ERROR ${statusCode}] ${err.message}`)
  }

  res.status(statusCode).json({
    // En producción los errores 500 muestran un mensaje genérico,
    // nunca el mensaje interno que podría revelar detalles del sistema.
    error: isProd && statusCode === 500
      ? 'Error interno del servidor.'
      : err.message,
    // El stack trace NUNCA sale en producción
    ...((!isProd) && { stack: err.stack }),
  })
}
