// ─── UploadController — S + D ─────────────────────────────────────────────────
// S: solo orquesta HTTP ↔ ImageService. No contiene lógica de procesado de imágenes.
// D: depende de ImageService (abstracción), no de sharp ni fs directamente.

import multer from 'multer'
import { ImageService } from './image.service.js'
import { ValidationError, ForbiddenError } from '../../shared/errors/AppError.js'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB  = 5
const isProd       = process.env.NODE_ENV === 'production'

// ─── MULTER — validación de entrada ──────────────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.includes(file.mimetype)
      ? cb(null, true)
      : cb(new ValidationError('Formato no válido. Usa JPG, PNG, WebP o GIF.'))
  },
})

// ─── POST /api/upload/product-image ──────────────────────────────────────────
export async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) throw new ValidationError('No se recibió ningún archivo.')

    // D: delega el procesado en ImageService
    const buffer = await ImageService.processToWebp(req.file.buffer)

    if (isProd) {
      // En Vercel no hay filesystem persistente → Data URL base64
      return res.status(201).json({ url: ImageService.toDataUrl(buffer) })
    }

    // En desarrollo → guardar en disco y devolver URL relativa
    const url = await ImageService.saveToDisk(buffer)
    res.status(201).json({ url })
  } catch (err) { next(err) }
}

// ─── DELETE /api/upload/product-image ────────────────────────────────────────
export async function deleteProductImage(req, res, next) {
  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') throw new ValidationError('URL requerida.')

    // En producción las imágenes son Data URLs — no hay archivo físico que borrar
    if (isProd || url.startsWith('data:')) {
      return res.json({ message: 'Imagen eliminada.' })
    }

    try {
      ImageService.deleteFromDisk(url)
    } catch {
      throw new ForbiddenError('Ruta de imagen no permitida.')
    }

    res.json({ message: 'Imagen eliminada.' })
  } catch (err) { next(err) }
}
