// ─── AppError — S: una sola razón para existir: representar errores de dominio ──
// Todos los errores del negocio se lanzan como AppError con statusCode semántico.
// El errorHandler de Express lo detecta y responde con el código correcto.
//
// Ventaja sobre "const err = new Error(); err.statusCode = 404":
//   - Tipado consistente: instanceof AppError funciona en cualquier catch
//   - Semántico: el nombre del error documenta la intención
//   - Centralizado: un solo lugar para cambiar el comportamiento de errores

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.name       = 'AppError'
    this.statusCode = statusCode
    // Captura el stack trace excluyendo este constructor
    Error.captureStackTrace?.(this, this.constructor)
  }
}

// ─── Errores semánticos — O: abiertos a extensión, cerrados a modificación ───
// Para agregar un nuevo tipo de error se extiende AppError, no se modifica.

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado.`, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Ya existe un registro con ese valor.') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado.') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado.') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos.') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Demasiadas peticiones. Intenta más tarde.') {
    super(message, 429)
    this.name = 'TooManyRequestsError'
  }
}
