import 'dotenv/config'
import express      from 'express'
import cors         from 'cors'
import helmet       from 'helmet'
import rateLimit    from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path              from 'path'

// ─── MÓDULOS ──────────────────────────────────────────────────────────────────
import authRoutes    from './modules/auth/auth.routes.js'
import productRoutes from './modules/products/product.routes.js'
import orderRoutes   from './modules/orders/order.routes.js'
import adminRoutes   from './modules/admin/admin.routes.js'
import contactRoutes from './modules/contact/contact.routes.js'
import uploadRoutes  from './modules/upload/upload.routes.js'

// ─── SHARED ───────────────────────────────────────────────────────────────────
import { notFound, errorHandler } from './shared/middleware/error.middleware.js'
import { TokenService }           from './shared/utils/TokenService.js'

const app       = express()
const PORT      = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd    = process.env.NODE_ENV === 'production'

// ─── 1. Trust proxy (Vercel / reverse proxies) ───────────────────────────────
app.set('trust proxy', 1)

// ─── 2. Helmet ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy:   false,
}))

// ─── 3. CORS ──────────────────────────────────────────────────────────────────
const allowedOrigin = isProd
  ? process.env.CLIENT_URL
  : (process.env.CLIENT_URL || 'http://localhost:5173')

if (isProd && !allowedOrigin) {
  console.error('FATAL: CLIENT_URL no definido en producción.')
  process.exit(1)
}

app.use(cors({
  origin:      allowedOrigin,
  credentials: true,
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

// ─── 8. Logout ────────────────────────────────────────────────────────────────
app.post('/api/auth/logout', (_req, res) => {
  TokenService.clearCookie(res)
  res.json({ message: 'Sesión cerrada.' })
})

// ─── 9. Rutas ─────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/contact',  contactRoutes)
app.use('/api/upload',   uploadRoutes)

// ─── 10. Manejo de errores ────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── Inicio ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    if (!isProd) {
      console.log(`\n🚀  TechStore API → http://localhost:${PORT}`)
      console.log(`📋  Entorno: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗  CORS:    ${allowedOrigin}\n`)
    }
  })
}

export default app
