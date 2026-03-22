import prisma from '../../config/prisma.js'

// ─── GET /api/users — listar todos (admin) ────────────────────────────────────
export async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true,
        role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (err) { next(err) }
}

// ─── GET /api/users/:id — ver uno (admin) ─────────────────────────────────────
export async function getUserById(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.params.id },
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, createdAt: true,
        orders: {
          select: {
            id: true, orderNumber: true,
            total: true, status: true, createdAt: true,
          },
        },
      },
    })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' })
    res.json(user)
  } catch (err) { next(err) }
}
