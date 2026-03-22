import { Router } from 'express'
import { protect, adminOnly } from '../../middleware/auth.middleware.js'
import { getAllUsers, getUserById } from './user.controller.js'

const router = Router()

router.get('/',    protect, adminOnly, getAllUsers)    // GET /api/users
router.get('/:id', protect, adminOnly, getUserById)   // GET /api/users/:id

export default router
