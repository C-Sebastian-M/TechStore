// ─── AdminOrdersService — I + S ───────────────────────────────────────────────
// I: quien solo necesita gestionar pedidos no recibe el contrato de usuarios ni categorías.
// S: una sola responsabilidad — administración de pedidos.

import prisma from '../../config/prisma.js'
import { NotFoundError } from '../../shared/errors/AppError.js'

export async function listAllOrders({ page = 1, limit = 20, status, search } = {}) {
  const where = {
    ...(status && { status }),
    ...(search && { OR: [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { name:  { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]}),
  }
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, image: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ])
  return { data: orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function getOrderDetail(id) {
  const order = await prisma.order.findUnique({
    where:   { id },
    include: {
      user:  { select: { name: true, email: true, phone: true } },
      items: { include: { product: { select: { name: true, brand: true, image: true, price: true } } } },
    },
  })
  if (!order) throw new NotFoundError('Pedido')
  return order
}

export async function setOrderStatus(id, status) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new NotFoundError('Pedido')
  return prisma.order.update({ where: { id }, data: { status } })
}
