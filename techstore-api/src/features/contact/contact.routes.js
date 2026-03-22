import { Router } from 'express'
import { sendMessage } from './contact.controller.js'

const router = Router()

router.post('/', sendMessage)   // POST /api/contact

export default router
