// ─── BARREL RE-EXPORT ─────────────────────────────────────────────────────────
// Los archivos fuente ahora viven en src/config/.
// Este archivo mantiene compatibilidad con todos los imports existentes.
// Cuando migremos los imports uno por uno, este archivo quedará vacío y se eliminará.

export * from '../config/constants.js'
export * from '../config/locale.js'
export * from '../config/routes.js'
