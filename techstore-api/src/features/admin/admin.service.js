import prisma from '../../config/prisma.js'

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const now        = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLast  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLast    = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    totalRevenue, monthRevenue, lastRevenue,
    totalOrders, monthOrders,
    totalUsers, monthUsers,
    ordersByStatus,
    lowStock,
    recentOrders,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: startMonth } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: startLast, lte: endLast } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startMonth } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startMonth } } }),
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.product.findMany({
      where:   { stock: { lte: 5 }, isActive: true },
      select:  { id: true, name: true, brand: true, stock: true, image: true },
      orderBy: { stock: 'asc' },
      take:    8,
    }),
    prisma.order.findMany({
      take:    8,
      orderBy: { createdAt: 'desc' },
      include: {
        user:  { select: { name: true, email: true } },
        items: { select: { qty: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by:      ['productId'],
      _sum:    { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take:    5,
    }),
  ])

  // Resolver datos de top productos
  const topProductIds  = topProductsRaw.map(t => t.productId)
  const topProductData = await prisma.product.findMany({
    where:  { id: { in: topProductIds } },
    select: { id: true, name: true, brand: true, image: true, price: true },
  })
  const topProducts = topProductsRaw.map(t => ({
    ...topProductData.find(p => p.id === t.productId),
    totalSold: t._sum.qty,
  }))

  const curr          = Number(monthRevenue._sum.total || 0)
  const prev          = Number(lastRevenue._sum.total  || 0)
  const revenueGrowth = prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100)

  return {
    revenue: {
      total:  Number(totalRevenue._sum.total || 0),
      month:  curr,
      growth: revenueGrowth,
    },
    orders: {
      total:  totalOrders,
      month:  monthOrders,
      byStatus: ordersByStatus.reduce((acc, r) => {
        acc[r.status] = r._count.id
        return acc
      }, {}),
    },
    users:       { total: totalUsers, month: monthUsers },
    lowStock,
    recentOrders,
    topProducts,
  }
}

// ─── USUARIOS ─────────────────────────────────────────────────────────────────
export async function listUsers({ page = 1, limit = 20, search, role } = {}) {
  const where = {
    ...(search && {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(role && { role }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip:    (page - 1) * limit,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, createdAt: true,
        _count: { select: { orders: true, favorites: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return { data: users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function getUserDetail(id) {
  const user = await prisma.user.findUnique({
    where:  { id },
    select: {
      id: true, email: true, name: true, phone: true,
      birthDate: true, role: true, createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, orderNumber: true, total: true,
          status: true, createdAt: true,
          items: { select: { qty: true } },
        },
      },
      _count: { select: { orders: true } },
    },
  })
  if (!user) {
    const err = new Error('Usuario no encontrado.')
    err.statusCode = 404
    throw err
  }
  return user
}

export async function changeUserRole(adminId, targetId, role) {
  if (targetId === adminId) {
    const err = new Error('No puedes cambiar tu propio rol.')
    err.statusCode = 400
    throw err
  }
  return prisma.user.update({
    where:  { id: targetId },
    data:   { role },
    select: { id: true, name: true, email: true, role: true },
  })
}

export async function removeUser(adminId, targetId) {
  if (targetId === adminId) {
    const err = new Error('No puedes eliminar tu propia cuenta.')
    err.statusCode = 400
    throw err
  }
  await prisma.user.delete({ where: { id: targetId } })
  return { message: 'Usuario eliminado correctamente.' }
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })
}

export async function createCategory(data) {
  return prisma.category.create({ data })
}

export async function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data })
}

export async function deleteCategory(id) {
  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    const err = new Error(`No se puede eliminar: tiene ${count} producto(s) asociados.`)
    err.statusCode = 400
    throw err
  }
  await prisma.category.delete({ where: { id } })
  return { message: 'Categoría eliminada.' }
}

// ─── PEDIDOS (admin) ──────────────────────────────────────────────────────────
export async function listAllOrders({ page = 1, limit = 20, status, search } = {}) {
  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name:  { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip:    (page - 1) * limit,
      take:    limit,
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
  if (!order) {
    const err = new Error('Pedido no encontrado.')
    err.statusCode = 404
    throw err
  }
  return order
}

export async function setOrderStatus(id, status) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) {
    const err = new Error('Pedido no encontrado.')
    err.statusCode = 404
    throw err
  }
  return prisma.order.update({ where: { id }, data: { status } })
}
