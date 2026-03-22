import { Router } from 'express'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.middleware.js'
import * as ctrl from '../controllers/product.controller.js'

const router = Router()

// ─── PÚBLICAS ─────────────────────────────────────────────────────────────────
// optionalAuth permite que admins puedan ver productos inactivos (includeInactive=true)
router.get('/',           optionalAuth, ctrl.getProducts)   // GET /api/products
router.get('/categories', ctrl.getCategories)               // GET /api/products/categories

// ─── REQUIEREN LOGIN ──────────────────────────────────────────────────────────
// IMPORTANTE: estas rutas con paths literales van ANTES de /:id para evitar conflictos
router.get ('/me/favorites',   protect, ctrl.getFavorites)    // GET  /api/products/me/favorites
router.post('/:id/favorite',   protect, ctrl.toggleFavorite)  // POST /api/products/:id/favorite

// ─── RUTA DINÁMICA por ID (debe ir después de las rutas literales) ─────────────
router.get('/:id', ctrl.getProduct)                           // GET /api/products/:id

// ─── SOLO ADMIN ───────────────────────────────────────────────────────────────
router.post  ('/',    protect, adminOnly, ctrl.createProduct)  // POST   /api/products
router.put   ('/:id', protect, adminOnly, ctrl.updateProduct)  // PUT    /api/products/:id
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct)  // DELETE /api/products/:id

export default router
