import { Router }   from 'express'
import multer        from 'multer'
import sharp         from 'sharp'
import path          from 'path'
import fs            from 'fs'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()
router.use(protect, adminOnly)

// ─── CONFIGURACIÓN DE MULTER ──────────────────────────────────────────────────
// Guarda el archivo original en memoria (buffer) para que sharp lo procese
// antes de escribir el resultado final al disco.
const storage = multer.memoryStorage()

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB  = 5    // Límite de archivo ORIGINAL (antes de optimizar)
const OUTPUT_SIZE  = 800  // Ancho/alto máximo del resultado en píxeles
const WEBP_QUALITY = 82   // Calidad WebP (0-100). 82 = excelente relación tamaño/calidad

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Formato no válido. Usa JPG, PNG, WebP o GIF.'))
    }
  },
})

// Carpeta donde se guardan las imágenes procesadas
const UPLOAD_DIR = path.resolve('uploads/products')

// ─── POST /api/upload/product-image ──────────────────────────────────────────
// Recibe: multipart/form-data con campo "image"
// Devuelve: { url: '/uploads/products/filename.webp' }
router.post('/product-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' })
    }

    // Nombre único basado en timestamp + random para evitar colisiones
    const filename = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`
    const outPath  = path.join(UPLOAD_DIR, filename)

    // Procesar con sharp:
    //  - Redimensionar a máx OUTPUT_SIZE × OUTPUT_SIZE manteniendo proporción
    //  - Convertir a WebP con calidad WEBP_QUALITY
    //  - withoutEnlargement: no agrandar imágenes pequeñas
    await sharp(req.file.buffer)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit:              'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outPath)

    // URL pública relativa al servidor
    const url = `/uploads/products/${filename}`
    res.status(201).json({ url })

  } catch (err) {
    next(err)
  }
})

// ─── DELETE /api/upload/product-image ────────────────────────────────────────
// Recibe: { url: '/uploads/products/filename.webp' }
// Borra el archivo del disco (solo archivos dentro de uploads/products)
router.delete('/product-image', async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL requerida.' })
    }

    // Seguridad: solo permitir eliminar archivos dentro de uploads/products
    const filename = path.basename(url)
    const filePath = path.join(UPLOAD_DIR, filename)

    // Verificar que el path resuelto esté dentro del directorio permitido
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
      return res.status(403).json({ error: 'Ruta no permitida.' })
    }

    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved)
    }

    res.json({ message: 'Imagen eliminada.' })
  } catch (err) {
    next(err)
  }
})

export default router
