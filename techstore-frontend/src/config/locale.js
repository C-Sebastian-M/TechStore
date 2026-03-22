// ─── LOCALE & FORMATO ─────────────────────────────────────────────────────────
// Centraliza idioma, moneda y formato de precio para todo el proyecto.
// Cambiar aquí actualiza automáticamente todos los precios de la app.

export const LOCALE   = 'es-CO'
export const CURRENCY = 'USD'

export const FORMAT_CURRENCY = (amount) =>
  amount.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
