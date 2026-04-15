import { Router } from 'express'
import { protect, adminOnly, optionalAuth } from '../../shared/middleware/auth.middleware.js'
import * as ctrl from './product.controller.js'

const router = Router()

// ─── PÚBLICAS ─────────────────────────────────────────────────────────────────
router.get('/',           optionalAuth, ctrl.getProducts)
router.get('/categories', ctrl.getCategories)

// ─── REQUIEREN LOGIN ──────────────────────────────────────────────────────────
// Las rutas literales van ANTES de /:id para evitar conflictos de Express
router.get ('/me/favorites',  protect, ctrl.getFavorites)
router.post('/:id/favorite',  protect, ctrl.toggleFavorite)

// ─── DINÁMICA POR ID ──────────────────────────────────────────────────────────
router.get('/:id', ctrl.getProduct)

// ─── SOLO ADMIN ───────────────────────────────────────────────────────────────
router.post  ('/',    protect, adminOnly, ctrl.createProduct)
router.put   ('/:id', protect, adminOnly, ctrl.updateProduct)
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct)

export default router
