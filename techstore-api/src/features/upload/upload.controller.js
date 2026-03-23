import multer from 'multer'
import sharp  from 'sharp'
import path   from 'path'
import fs     from 'fs'

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB  = 5
const OUTPUT_SIZE  = 800
const WEBP_QUALITY = 82

// En producción (Vercel) no hay filesystem persistente — usamos /tmp
// En desarrollo usamos uploads/products/
const isProd      = process.env.NODE_ENV === 'production'
export const UPLOAD_DIR = isProd
  ? '/tmp'
  : path.resolve('uploads/products')

// Crear directorio si no existe (solo en desarrollo)
if (!isProd && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// ─── MULTER — memoria para procesado con sharp ────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Formato no válido. Usa JPG, PNG, WebP o GIF.'))
  },
})

// ─── POST /api/upload/product-image ──────────────────────────────────────────
// En producción: procesa con sharp y devuelve la imagen como Data URL (base64).
// En desarrollo: guarda en disco y devuelve URL relativa.
export async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' })
    }

    // Procesar con sharp → buffer WebP optimizado
    const outputBuffer = await sharp(req.file.buffer)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    if (isProd) {
      // Producción (Vercel): devolver como Data URL base64
      // El frontend guarda esta URL directamente en la BD — no depende de filesystem
      const base64 = outputBuffer.toString('base64')
      const dataUrl = `data:image/webp;base64,${base64}`
      return res.status(201).json({ url: dataUrl })
    }

    // Desarrollo: guardar en disco
    const filename = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`
    const outPath  = path.join(UPLOAD_DIR, filename)
    await sharp(outputBuffer).toFile(outPath)
    res.status(201).json({ url: `/uploads/products/${filename}` })

  } catch (err) { next(err) }
}

// ─── DELETE /api/upload/product-image ────────────────────────────────────────
export async function deleteProductImage(req, res, next) {
  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL requerida.' })
    }

    // En producción las imágenes son Data URLs — no hay archivo que borrar
    if (isProd || url.startsWith('data:')) {
      return res.json({ message: 'Imagen eliminada.' })
    }

    const filename = path.basename(url)
    const filePath = path.join(UPLOAD_DIR, filename)
    const resolved = path.resolve(filePath)

    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
      return res.status(403).json({ error: 'Ruta no permitida.' })
    }

    if (fs.existsSync(resolved)) fs.unlinkSync(resolved)
    res.json({ message: 'Imagen eliminada.' })
  } catch (err) { next(err) }
}
