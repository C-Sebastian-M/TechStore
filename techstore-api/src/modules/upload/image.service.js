// ─── ImageService — S: una sola responsabilidad: procesar imágenes ───────────────
// O: para cambiar el algoritmo de compresión o el formato de salida
//    solo se modifica este archivo, el controller no lo nota.
// D: el controller depende de ImageService (abstracción), no de sharp directamente.

import sharp from 'sharp'
import path  from 'path'
import fs    from 'fs'

const OUTPUT_SIZE  = 800
const WEBP_QUALITY = 82
const isProd       = process.env.NODE_ENV === 'production'

export const UPLOAD_DIR = isProd ? '/tmp' : path.resolve('uploads/products')

// Crear directorio en desarrollo si no existe
if (!isProd && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export const ImageService = {

  // Procesa un buffer de imagen y devuelve un buffer WebP optimizado
  async processToWebp(inputBuffer) {
    return sharp(inputBuffer)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
  },

  // Guarda el buffer en disco (solo desarrollo) y devuelve la URL relativa
  async saveToDisk(buffer) {
    const filename = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`
    const outPath  = path.join(UPLOAD_DIR, filename)
    await sharp(buffer).toFile(outPath)
    return `/uploads/products/${filename}`
  },

  // Convierte buffer a Data URL base64 (producción — sin filesystem persistente)
  toDataUrl(buffer) {
    return `data:image/webp;base64,${buffer.toString('base64')}`
  },

  // Elimina un archivo del disco de forma segura (protección path traversal)
  deleteFromDisk(relativeUrl) {
    const filename = path.basename(relativeUrl)
    const filePath = path.join(UPLOAD_DIR, filename)
    const resolved = path.resolve(filePath)

    // Verificar que la ruta no escapa del directorio permitido
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
      throw new Error('Ruta no permitida.')
    }
    if (fs.existsSync(resolved)) fs.unlinkSync(resolved)
  },
}
