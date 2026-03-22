import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import * as ctrl              from '../controllers/order.controller.js'

const router = Router()

// Todas las rutas de pedidos requieren autenticación
router.use(protect)

// ─── USUARIO ──────────────────────────────────────────────────────────────────
router.post('/',  ctrl.createOrder)   // POST /api/orders
router.get ('/',  ctrl.getMyOrders)   // GET  /api/orders

// ─── ADMIN ────────────────────────────────────────────────────────────────────
// IMPORTANTE: rutas literales ANTES de /:id para evitar que Express
// capture 'admin' como parámetro dinámico.
router.get   ('/admin/all',   adminOnly, ctrl.getAllOrders)       // GET   /api/orders/admin/all
router.patch ('/:id/status',  adminOnly, ctrl.updateOrderStatus)  // PATCH /api/orders/:id/status

// ─── RUTA DINÁMICA (debe ir al final) ─────────────────────────────────────────
router.get('/:id', ctrl.getOrder)    // GET /api/orders/:id

export default router
