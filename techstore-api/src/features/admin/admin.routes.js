import { Router } from 'express'
import { protect, adminOnly } from '../../middleware/auth.middleware.js'
import * as ctrl from './admin.controller.js'

const router = Router()
router.use(protect, adminOnly)

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
router.get('/dashboard', ctrl.getDashboard)

// ─── USUARIOS ────────────────────────────────────────────────────────────────
router.get   ('/users',           ctrl.getUsers)
router.get   ('/users/:id',       ctrl.getUser)
router.patch ('/users/:id/role',  ctrl.patchUserRole)
router.delete('/users/:id',       ctrl.deleteUser)

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────
router.get   ('/categories',      ctrl.getCategories)
router.post  ('/categories',      ctrl.postCategory)
router.put   ('/categories/:id',  ctrl.putCategory)
router.delete('/categories/:id',  ctrl.deleteCategory)

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────
router.get   ('/orders',          ctrl.getOrders)
router.get   ('/orders/:id',      ctrl.getOrder)
router.patch ('/orders/:id/status', ctrl.patchOrderStatus)

export default router
