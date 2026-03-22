import { Router } from 'express'
import { protect, adminOnly }              from '../../middleware/auth.middleware.js'
import { upload, uploadProductImage, deleteProductImage } from './upload.controller.js'

const router = Router()
router.use(protect, adminOnly)

router.post  ('/product-image', upload.single('image'), uploadProductImage)
router.delete('/product-image',                         deleteProductImage)

export default router
