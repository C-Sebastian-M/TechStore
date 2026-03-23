import 'dotenv/config'
import express           from 'express'
import cors              from 'cors'
import helmet            from 'helmet'
import rateLimit         from 'express-rate-limit'
import cookieParser      from 'cookie-parser'
import { fileURLToPath } from 'url'
import path              from 'path'

// ─── Rutas ───────────────────────────────────────────────────────────────────
import authRoutes    from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import orderRoutes   from './routes/order.routes.js'
import adminRoutes   from './features/admin/admin.routes.js'
import userRoutes    from './features/users/user.routes.js'
import contactRoutes from './features/contact/contact.routes.js'
import uploadRoutes  from './features/upload/upload.routes.js'

import { errorHandler, notFound } from './middleware/error.middleware.js'

const app       = express()
const PORT      = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd    = process.env.NODE_ENV === 'production'

// ─── 1. Trust proxy ───────────────────────────────────────────────────────────
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
  console.error('❌ FATAL: CLIENT_URL no está definido en producción.')
  process.exit(1)
}

app.use(cors({
  origin:      allowedOrigin,
  credentials: true,              // necesario para enviar/recibir cookies
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))

// ─── 4. Body parser + cookie parser ──────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())           // lee req.cookies.token

// ─── 5. Rate limiting ─────────────────────────────────────────────────────────
const limiterOpts = { standardHeaders: true, legacyHeaders: false }
app.use('/api/',                  rateLimit({ ...limiterOpts, windowMs: 15*60*1000, max: 300, message: { error: 'Demasiadas peticiones. Espera unos minutos.' } }))
app.use('/api/auth/login',        rateLimit({ ...limiterOpts, windowMs: 15*60*1000, max: 10,  message: { error: 'Demasiados intentos. Espera 15 minutos.' } }))
app.use('/api/auth/register',     rateLimit({ ...limiterOpts, windowMs: 60*60*1000, max: 5,   message: { error: 'Demasiados registros. Espera una hora.' } }))
app.use('/api/auth/verify-email', rateLimit({ ...limiterOpts, windowMs: 15*60*1000, max: 10,  message: { error: 'Demasiados intentos de verificación. Espera 15 minutos.' } }))
app.use('/api/contact',           rateLimit({ ...limiterOpts, windowMs: 60*60*1000, max: 10,  message: { error: 'Demasiados mensajes. Espera una hora.' } }))

// ─── Archivos estáticos ───────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ─── Salud ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() })
)

// ─── Logout — limpia la cookie httpOnly ──────────────────────────────────────
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    path:     '/',
  })
  res.json({ message: 'Sesión cerrada.' })
})

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/contact',  contactRoutes)
app.use('/api/upload',   uploadRoutes)

// ─── Manejo de errores ────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── Inicio ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀  TechStore API → http://localhost:${PORT}`)
    console.log(`📋  Entorno  : ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗  CORS     : ${allowedOrigin}`)
    console.log(`🛡️   Helmet + Rate limiting + Cookies httpOnly: activo`)
  })
}

export default app
