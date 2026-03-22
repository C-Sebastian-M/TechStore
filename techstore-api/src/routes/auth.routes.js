import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import * as ctrl   from '../controllers/auth.controller.js'

const router = Router()

// ─── PÚBLICAS ─────────────────────────────────────────────────────────────────
router.post('/register', ctrl.register)
router.post('/login',    ctrl.login)

// ─── PROTEGIDAS (requieren token) ─────────────────────────────────────────────
router.get ('/me',                   protect, ctrl.getMe)
router.put ('/me',                   protect, ctrl.updateMe)
router.put ('/me/password',          protect, ctrl.changePassword)
router.post('/me/addresses',         protect, ctrl.addAddress)
router.put ('/me/addresses/:id',     protect, ctrl.updateAddress)
router.delete('/me/addresses/:id',   protect, ctrl.deleteAddress)

export default router
