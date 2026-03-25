import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import * as ctrl   from '../controllers/auth.controller.js'

const router = Router()

// ─── PÚBLICAS ─────────────────────────────────────────────────────────────────
router.post('/register',     ctrl.register)    // Paso 1: enviar código
router.post('/verify-email', ctrl.verifyEmail) // Paso 2: verificar y crear cuenta
router.post('/login',        ctrl.login)
router.post('/google',       ctrl.googleAuth)

// ─── PROTEGIDAS (requieren token) ─────────────────────────────────────────────
router.get   ('/me',                 protect, ctrl.getMe)
router.put   ('/me',                 protect, ctrl.updateMe)
router.put   ('/me/password',        protect, ctrl.changePassword)
router.put   ('/me/set-password',    protect, ctrl.setPassword)
router.post  ('/me/addresses',       protect, ctrl.addAddress)
router.put   ('/me/addresses/:id',   protect, ctrl.updateAddress)
router.delete('/me/addresses/:id',   protect, ctrl.deleteAddress)

export default router
