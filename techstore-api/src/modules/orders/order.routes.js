import { Router } from 'express'
import { protect, adminOnly } from '../../shared/middleware/auth.middleware.js'
import * as ctrl              from './order.controller.js'

const router = Router()

router.use(protect)

// ─── USUARIO ──────────────────────────────────────────────────────────────────
router.post('/', ctrl.createOrder)
router.get ('/', ctrl.getMyOrders)

// ─── ADMIN — rutas literales ANTES de /:id ────────────────────────────────────
router.get  ('/admin/all',   adminOnly, ctrl.getAllOrders)
router.patch('/:id/status',  adminOnly, ctrl.updateOrderStatus)

// ─── DINÁMICA ─────────────────────────────────────────────────────────────────
router.get('/:id', ctrl.getOrder)

export default router
