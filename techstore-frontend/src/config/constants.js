// ─── CONSTANTES DE NEGOCIO ────────────────────────────────────────────────────
// Reglas del modelo de negocio de TechStore Colombia.
// Son la fuente única de verdad — nunca hardcodear estos valores en componentes.

// Impuestos y costos de envío (deben coincidir con order.service.js del backend)
export const TAX_RATE               = 0.19    // IVA Colombia 19%
export const SHIPPING_COST          = 24.99   // USD fijo por pedido
export const FREE_SHIPPING_THRESHOLD = 150    // Envío gratis sobre este monto (USD)

// Límites del carrito
export const CART_MAX_QTY = 5   // Máximo de unidades por ítem
export const CART_MIN_QTY = 1

// Códigos promocionales válidos
export const PROMO_CODES = {
  TECHSTORE10: { discount: 0.10, label: '10% de descuento' },
  BIENVENIDO:  { discount: 0.15, label: '15% de descuento' },
  GAMING2025:  { discount: 0.05, label: '5% de descuento'  },
}

// Configurador PC
export const PSU_HEADROOM_WATTS = 100   // Margen de seguridad para la fuente de poder

// Pedidos
export const ORDER_ID_PREFIX   = 'TS-'
export const DELIVERY_DAYS_MIN = 1
export const DELIVERY_DAYS_MAX = 2
