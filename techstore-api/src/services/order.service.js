import prisma from '../config/prisma.js'

// ─── CONSTANTES DEL NEGOCIO ───────────────────────────────────────────────────
const TAX_RATE                = 0.19   // IVA Colombia
const SHIPPING_COST           = 24.99  // USD fijo (Colombia)
const FREE_SHIPPING_THRESHOLD = 150    // Gratis sobre $150 USD
const PROMO_CODES = {
  TECHSTORE10: 0.10,
  BIENVENIDO:  0.15,
  GAMING2025:  0.05,
}

// ─── GENERADOR DE NÚMERO DE PEDIDO ───────────────────────────────────────────
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random    = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `TS-${timestamp}${random}`
}

// ─── CREAR PEDIDO (con transacción ACID) ─────────────────────────────────────
export async function createOrder(userId, { items, shipping, paymentMethod, promoCode }) {

  // ── Transacción: todo ocurre junto o nada ocurre ──────────────────────────
  return prisma.$transaction(async (tx) => {

    // 1. Verificar que todos los productos existen y tienen stock suficiente
    const productIds = items.map(i => i.productId)
    const products   = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true }
    })

    if (products.length !== items.length) {
      const err = new Error('Uno o más productos no están disponibles.')
      err.statusCode = 400
      throw err
    }

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (product.stock < item.qty) {
        const err = new Error(`Stock insuficiente para: ${product.name} (disponible: ${product.stock})`)
        err.statusCode = 400
        throw err
      }
    }

    // 2. Calcular totales
    const subtotal = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + Number(product.price) * item.qty
    }, 0)

    const discountRate = promoCode && PROMO_CODES[promoCode?.toUpperCase()]
      ? PROMO_CODES[promoCode.toUpperCase()]
      : 0

    const discount            = subtotal * discountRate
    const discountedSubtotal  = subtotal - discount
    const tax                 = discountedSubtotal * TAX_RATE
    const shippingCost        = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total               = discountedSubtotal + tax + shippingCost

    // 3. Crear el pedido
    const order = await tx.order.create({
      data: {
        orderNumber:       generateOrderNumber(),
        userId,
        paymentMethod,
        promoCode:         promoCode?.toUpperCase() || null,
        subtotal,
        discount,
        tax,
        shipping:          shippingCost,
        total,
        shippingName:      shipping.fullName,
        shippingAddress:   shipping.address,
        shippingCity:      shipping.city,
        shippingPostalCode: shipping.postalCode || null,
        shippingCountry:   shipping.country,
        items: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.productId)
            return {
              productId: item.productId,
              qty:       item.qty,
              unitPrice: product.price,
            }
          })
        }
      },
      include: {
        items: {
          include: { product: { select: { name: true, brand: true, image: true } } }
        }
      }
    })

    // 4. Descontar stock de cada producto
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.qty } },
      })
    }

    return order
  })
}

// ─── LISTAR PEDIDOS DEL USUARIO ───────────────────────────────────────────────
// Paginado para evitar respuestas enormes si el usuario tiene muchos pedidos.
export async function getOrdersByUser(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where:   { userId },
      skip,
      take:    limit,
      include: {
        items: {
          include: {
            product: { select: { name: true, brand: true, image: true, price: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: { userId } }),
  ])

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ─── OBTENER UN PEDIDO ────────────────────────────────────────────────────────
export async function getOrderById(orderId, userId) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: { select: { name: true, brand: true, image: true, price: true } }
        }
      }
    }
  })

  if (!order) {
    const err = new Error('Pedido no encontrado.')
    err.statusCode = 404
    throw err
  }

  return order
}

// ─── ACTUALIZAR ESTADO (solo admin) ──────────────────────────────────────────
export async function updateOrderStatus(orderId, status) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    const err = new Error('Pedido no encontrado.')
    err.statusCode = 404
    throw err
  }
  return prisma.order.update({
    where: { id: orderId },
    data:  { status },
  })
}

// ─── TODOS LOS PEDIDOS (solo admin) ──────────────────────────────────────────
export async function getAllOrders({ page = 1, limit = 20, status } = {}) {
  const skip  = (page - 1) * limit
  const where = status ? { status } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take:    limit,
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  return {
    data: orders,
    pagination: {
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
