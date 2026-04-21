// ─── OrderService — S + D ─────────────────────────────────────────────────────
// S: una sola responsabilidad — lógica de negocio de pedidos.
// D: depende de AppError (abstracción) y constantes de entorno, no hardcodeadas.

import prisma from '../../config/prisma.js'
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js'

// D: constantes vienen de entorno — para cambiarlas no hace falta tocar código
const TAX_RATE                = Number(process.env.TAX_RATE)                || 0.19
const SHIPPING_COST           = Number(process.env.SHIPPING_COST)           || 24.99
const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD) || 150

const PROMO_CODES = {
  TECHSTORE10: 0.10,
  BIENVENIDO:  0.15,
  GAMING2025:  0.05,
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random    = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `TS-${timestamp}${random}`
}

// ─── CREAR PEDIDO (transacción ACID) ─────────────────────────────────────────
export async function createOrder(userId, { items, shipping, paymentMethod, promoCode }) {
  return prisma.$transaction(async (tx) => {

    const productIds = items.map(i => i.productId)
    const products   = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    if (products.length !== items.length) {
      throw new ValidationError('Uno o más productos no están disponibles.')
    }

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (product.stock < item.qty) {
        throw new ValidationError(`Stock insuficiente para: ${product.name} (disponible: ${product.stock})`)
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + Number(product.price) * item.qty
    }, 0)

    const discountRate       = promoCode && PROMO_CODES[promoCode?.toUpperCase()] ? PROMO_CODES[promoCode.toUpperCase()] : 0
    const discount           = subtotal * discountRate
    const discountedSubtotal = subtotal - discount
    const tax                = discountedSubtotal * TAX_RATE
    const shippingCost       = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total              = discountedSubtotal + tax + shippingCost

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId, paymentMethod,
        promoCode:          promoCode?.toUpperCase() || null,
        subtotal, discount, tax,
        shipping:           shippingCost, total,
        shippingName:       shipping.fullName,
        shippingAddress:    shipping.address,
        shippingCity:       shipping.city,
        shippingPostalCode: shipping.postalCode || null,
        shippingCountry:    shipping.country,
        items: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.productId)
            return { productId: item.productId, qty: item.qty, unitPrice: product.price }
          }),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, brand: true, image: true } } } },
      },
    })

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
export async function getOrdersByUser(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId }, skip, take: limit,
      include: { items: { include: { product: { select: { name: true, brand: true, image: true, price: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: { userId } }),
  ])
  return { data: orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function getOrderById(orderId, userId) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: { include: { product: { select: { name: true, brand: true, image: true, price: true } } } } },
  })
  if (!order) throw new NotFoundError('Pedido')
  return order
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export async function updateOrderStatus(orderId, status) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new NotFoundError('Pedido')
  return prisma.order.update({ where: { id: orderId }, data: { status } })
}

export async function getAllOrders({ page = 1, limit = 20, status } = {}) {
  const skip  = (page - 1) * limit
  const where = status ? { status } : {}
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: limit,
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])
  return { data: orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}
