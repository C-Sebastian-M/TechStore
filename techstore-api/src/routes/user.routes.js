import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import prisma from '../config/prisma.js'

const router = Router()

// ─── ADMIN: listar todos los usuarios ─────────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true,
        role: true, createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (err) { next(err) }
})

// ─── ADMIN: ver un usuario ────────────────────────────────────────────────────
router.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.params.id },
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, createdAt: true,
        orders: { select: { id: true, orderNumber: true, total: true, status: true, createdAt: true } }
      }
    })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' })
    res.json(user)
  } catch (err) { next(err) }
})

export default router
