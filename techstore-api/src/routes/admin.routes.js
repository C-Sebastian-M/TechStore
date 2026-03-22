import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import prisma from '../config/prisma.js'
import { z } from 'zod'

const router = Router()
router.use(protect, adminOnly)

// ─── GET /api/admin/dashboard ──────────────────────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
  try {
    const now       = new Date()
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
      topProducts,
    ] = await Promise.all([
      // Ingresos totales
      prisma.order.aggregate({
        where:   { status: { not: 'CANCELLED' } },
        _sum:    { total: true },
      }),
      // Ingresos este mes
      prisma.order.aggregate({
        where:   { status: { not: 'CANCELLED' }, createdAt: { gte: startMonth } },
        _sum:    { total: true },
      }),
      // Ingresos mes pasado
      prisma.order.aggregate({
        where:   { status: { not: 'CANCELLED' }, createdAt: { gte: startLast, lte: endLast } },
        _sum:    { total: true },
      }),
      // Total pedidos
      prisma.order.count(),
      // Pedidos este mes
      prisma.order.count({ where: { createdAt: { gte: startMonth } } }),
      // Total usuarios
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      // Usuarios este mes
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startMonth } } }),
      // Pedidos por estado
      prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
      // Productos con bajo stock (≤ 5)
      prisma.product.findMany({
        where:   { stock: { lte: 5 }, isActive: true },
        select:  { id: true, name: true, brand: true, stock: true, image: true },
        orderBy: { stock: 'asc' },
        take:    8,
      }),
      // Pedidos recientes
      prisma.order.findMany({
        take:    8,
        orderBy: { createdAt: 'desc' },
        include: {
          user:  { select: { name: true, email: true } },
          items: { select: { qty: true } },
        },
      }),
      // Top productos más vendidos
      prisma.orderItem.groupBy({
        by:      ['productId'],
        _sum:    { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take:    5,
      }),
    ])

    // Resolver nombres de top productos
    const topProductIds = topProducts.map(t => t.productId)
    const topProductData = await prisma.product.findMany({
      where:  { id: { in: topProductIds } },
      select: { id: true, name: true, brand: true, image: true, price: true },
    })
    const topProductsMapped = topProducts.map(t => ({
      ...topProductData.find(p => p.id === t.productId),
      totalSold: t._sum.qty,
    }))

    // Calcular variación mes actual vs mes pasado
    const curr = Number(monthRevenue._sum.total  || 0)
    const prev = Number(lastRevenue._sum.total    || 0)
    const revenueGrowth = prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100)

    res.json({
      revenue: {
        total:   Number(totalRevenue._sum.total || 0),
        month:   curr,
        growth:  revenueGrowth,
      },
      orders: {
        total:  totalOrders,
        month:  monthOrders,
        byStatus: ordersByStatus.reduce((acc, r) => {
          acc[r.status] = r._count.id
          return acc
        }, {}),
      },
      users: {
        total:  totalUsers,
        month:  monthUsers,
      },
      lowStock,
      recentOrders,
      topProducts: topProductsMapped,
    })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = z.object({
      page:   z.coerce.number().default(1),
      limit:  z.coerce.number().default(20),
      search: z.string().optional(),
      role:   z.enum(['CUSTOMER', 'ADMIN']).optional(),
    }).parse(req.query)

    const where = {
      ...(search && {
        OR: [
          { name:  { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
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

    res.json({
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/users/:id ──────────────────────────────────────────────────
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.params.id },
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
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' })
    res.json(user)
  } catch (err) { next(err) }
})

// ─── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = z.object({
      role: z.enum(['CUSTOMER', 'ADMIN']),
    }).parse(req.body)

    // No permitir que el admin se quite el rol a sí mismo
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio rol.' })
    }

    const user = await prisma.user.update({
      where:  { id: req.params.id },
      data:   { role },
      select: { id: true, name: true, email: true, role: true },
    })
    res.json(user)
  } catch (err) { next(err) }
})

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' })
    }
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'Usuario eliminado correctamente.' })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/categories ─────────────────────────────────────────────────
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    })
    res.json(categories)
  } catch (err) { next(err) }
})

// ─── POST /api/admin/categories ───────────────────────────────────────────────
router.post('/categories', async (req, res, next) => {
  try {
    const data = z.object({
      name:  z.string().min(2),
      slug:  z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
      image: z.string().url().optional().nullable(),
    }).parse(req.body)

    const category = await prisma.category.create({ data })
    res.status(201).json(category)
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/categories/:id ────────────────────────────────────────────
router.put('/categories/:id', async (req, res, next) => {
  try {
    const data = z.object({
      name:  z.string().min(2).optional(),
      slug:  z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
      image: z.string().url().optional().nullable(),
    }).parse(req.body)

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    })
    res.json(category)
  } catch (err) { next(err) }
})

// ─── DELETE /api/admin/categories/:id ─────────────────────────────────────────
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const count = await prisma.product.count({ where: { categoryId: req.params.id } })
    if (count > 0) {
      return res.status(400).json({ error: `No se puede eliminar: tiene ${count} producto(s) asociados.` })
    }
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ message: 'Categoría eliminada.' })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/orders ─────────────────────────────────────────────────────
router.get('/orders', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = z.object({
      page:   z.coerce.number().default(1),
      limit:  z.coerce.number().default(20),
      status: z.string().optional(),
      search: z.string().optional(),
    }).parse(req.query)

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
          items: {
            include: {
              product: { select: { name: true, image: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    res.json({
      data: orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/orders/:id ─────────────────────────────────────────────────
router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where:   { id: req.params.id },
      include: {
        user:  { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, brand: true, image: true, price: true } },
          },
        },
      },
    })
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' })
    res.json(order)
  } catch (err) { next(err) }
})

// ─── PATCH /api/admin/orders/:id/status ───────────────────────────────────────
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['RECEIVED','PAYMENT_CONFIRMED','PREPARING','SHIPPED','DELIVERED','CANCELLED']),
    }).parse(req.body)

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data:  { status },
    })
    res.json(order)
  } catch (err) { next(err) }
})

export default router
