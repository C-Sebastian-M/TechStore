// ─── AdminService (Dashboard) — S ────────────────────────────────────────────────
// Solo responsabilidad: calcular estadísticas del dashboard.
// Usuarios, categorías y pedidos viven en sus propios servicios.

import prisma from '../../config/prisma.js'

export async function getDashboardStats() {
  const now        = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLast  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLast    = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    totalRevenue, monthRevenue, lastRevenue,
    totalOrders,  monthOrders,
    totalUsers,   monthUsers,
    ordersByStatus, lowStock, recentOrders, topProductsRaw,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } },                                               _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: startMonth } },               _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: startLast, lte: endLast } },  _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startMonth } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startMonth } } }),
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      select: { id: true, name: true, brand: true, stock: true, image: true },
      orderBy: { stock: 'asc' }, take: 8,
    }),
    prisma.order.findMany({
      take: 8, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: { select: { qty: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'], _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } }, take: 5,
    }),
  ])

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
    revenue: { total: Number(totalRevenue._sum.total || 0), month: curr, growth: revenueGrowth },
    orders:  {
      total: totalOrders, month: monthOrders,
      byStatus: ordersByStatus.reduce((acc, r) => { acc[r.status] = r._count.id; return acc }, {}),
    },
    users:   { total: totalUsers, month: monthUsers },
    lowStock, recentOrders, topProducts,
  }
}
