import api from './api.js'

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────

// Crear un nuevo pedido
// items: [{ productId, qty }]
// shipping: { fullName, address, city, postalCode, country }
export async function createOrder({ items, shipping, paymentMethod, promoCode }) {
  return api.post('/orders', { items, shipping, paymentMethod, promoCode })
}

// Obtener todos los pedidos del usuario autenticado
export async function getMyOrders() {
  return api.get('/orders')
}

// Obtener detalle de un pedido específico
export async function getOrderById(id) {
  return api.get(`/orders/${id}`)
}
