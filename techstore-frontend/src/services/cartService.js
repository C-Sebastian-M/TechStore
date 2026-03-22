import { TAX_RATE, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, CART_MAX_QTY, CART_MIN_QTY, PROMO_CODES } from '../constants'

// ─── CÁLCULO DE TOTALES ───────────────────────────────────────────────────────
export function calculateTotals(items, promoCode = null) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.qty, 0)

  const discount = promoCode && PROMO_CODES[promoCode]
    ? subtotal * PROMO_CODES[promoCode].discount
    : 0

  const discountedSubtotal = subtotal - discount
  const tax                = discountedSubtotal * TAX_RATE
  // Sin productos no hay costo de envio
  const shipping           = items.length === 0
    ? 0
    : discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total              = discountedSubtotal + tax + shipping
  const itemCount          = items.reduce((sum, item) => sum + item.qty, 0)

  return { subtotal, discount, discountedSubtotal, tax, shipping, total, itemCount }
}

// ─── APLICAR CÓDIGO PROMO ─────────────────────────────────────────────────────
export function applyPromoCode(code) {
  const promo = PROMO_CODES[code?.trim().toUpperCase()]
  if (!promo) return { valid: false, message: 'Código no válido o expirado' }
  return { valid: true, ...promo }
}

// ─── AGREGAR AL CARRITO ───────────────────────────────────────────────────────
export function addItemToCart(items, product) {
  const existing = items.find(i => i.id === product.id)
  if (existing) {
    if (existing.qty >= CART_MAX_QTY) return items // no superar el máximo
    return items.map(i =>
      i.id === product.id ? { ...i, qty: i.qty + 1 } : i
    )
  }
  return [...items, { ...product, qty: 1 }]
}

// ─── ACTUALIZAR CANTIDAD ──────────────────────────────────────────────────────
export function updateItemQty(items, id, qty) {
  if (qty < CART_MIN_QTY) return items.filter(i => i.id !== id)
  if (qty > CART_MAX_QTY) return items
  return items.map(i => i.id === id ? { ...i, qty } : i)
}

// ─── ELIMINAR DEL CARRITO ─────────────────────────────────────────────────────
export function removeItem(items, id) {
  return items.filter(i => i.id !== id)
}
