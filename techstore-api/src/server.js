import 'dotenv/config'
import express      from 'express'
import cors         from 'cors'
import helmet       from 'helmet'
import rateLimit    from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path              from 'path'

// ─── MÓDULOS ──────────────────────────────────────────────────────────────────
let authRoutes, productRoutes, orderRoutes, adminRoutes, contactRoutes, uploadRoutes
let notFound, errorHandler, TokenService

try {
  authRoutes    = (await import('./modules/auth/auth.routes.js')).default
  productRoutes = (await import('./modules/products/product.routes.js')).default
  orderRoutes   = (await import('./modules/orders/order.routes.js')).default
  adminRoutes   = (await import('./modules/admin/admin.routes.js')).default
  contactRoutes = (await import('./modules/contact/contact.routes.js')).default
  uploadRoutes  = (await import('./modules/upload/upload.routes.js')).default
  const errorMw = await import('./shared/middleware/error.middleware.js')
  notFound      = errorMw.notFound
  errorHandler  = errorMw.errorHandler
  TokenService  = (await import('./shared/utils/TokenService.js')).TokenService
} catch (err) {
  console.error('❌ ERROR AL IMPORTAR MÓDULOS:', err.message)
  console.error(err.stack)
  process.exit(1)
}

const app       = express()
const PORT      = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd    = process.env.NODE_ENV === 'production'

// ─── 1. Trust proxy (Vercel / reverse proxies) ───────────────────────────────
app.set('trust proxy', 1)

// ─── 2. Helmet ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy:   false,   // necesario para Google OAuth popup
}))

// ─── 3. CORS ──────────────────────────────────────────────────────────────────
const allowedOrigin = isProd
  ? process.env.CLIENT_URL
  : (process.env.CLIENT_URL || 'http://localhost:5173')

if (isProd && !allowedOrigin) {
  console.error('❌ FATAL: CLIENT_URL no definido en producción.')
  process.exit(1)
}

app.use(cors({
  origin:      allowedOrigin,
  credentials: true,   // necesario para cookies httpOnly cross-origin
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// ─── 4. Parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())

// ─── 5. Rate limiting ─────────────────────────────────────────────────────────
const limiter = (max, windowMs, message) =>
  rateLimit({ standardHeaders: true, legacyHeaders: false, windowMs, max, message: { error: message } })

app.use('/api/',                  limiter(300, 15 * 60 * 1000, 'Demasiadas peticiones. Espera unos minutos.'))
app.use('/api/auth/login',        limiter(10,  15 * 60 * 1000, 'Demasiados intentos. Espera 15 minutos.'))
app.use('/api/auth/register',     limiter(5,   60 * 60 * 1000, 'Demasiados registros. Espera una hora.'))
app.use('/api/auth/verify-email', limiter(10,  15 * 60 * 1000, 'Demasiados intentos de verificación. Espera 15 minutos.'))
app.use('/api/contact',           limiter(10,  60 * 60 * 1000, 'Demasiados mensajes. Espera una hora.'))

// ─── 6. Archivos estáticos (solo desarrollo) ──────────────────────────────────
if (!isProd) {
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
}

// ─── 7. Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() })
)

// ─── 8. Logout — D: delega en TokenService, no usa res.clearCookie directamente
app.post('/api/auth/logout', (_req, res) => {
  TokenService.clearCookie(res)
  res.json({ message: 'Sesión cerrada.' })
})

// ─── 9. Rutas de la API ───────────────────────────────────────────────────────
//
//  Arquitectura: Layered + Modular
//  ┌─────────────────────────────────────────────────┐
//  │  src/modules/                                   │
//  │    auth/     → /api/auth                        │
//  │    products/ → /api/products                    │
//  │    orders/   → /api/orders                      │
//  │    admin/    → /api/admin                       │
//  │    contact/  → /api/contact                     │
//  │    upload/   → /api/upload                      │
//  └─────────────────────────────────────────────────┘
//
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/contact',  contactRoutes)
app.use('/api/upload',   uploadRoutes)

// ─── 10. Manejo de errores ────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── Inicio (no ejecutar en modo test) ────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀  TechStore API corriendo en http://localhost:${PORT}`)
    console.log(`📋  Entorno : ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗  CORS    : ${allowedOrigin}`)
    console.log(`\n📦  Módulos activos:`)
    console.log(`    auth · products · orders · admin · contact · upload`)
  })
}

export default app
