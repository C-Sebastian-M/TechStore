import 'dotenv/config'
import express           from 'express'
import cors              from 'cors'
import helmet            from 'helmet'
import rateLimit         from 'express-rate-limit'
import { fileURLToPath } from 'url'
import path              from 'path'

// ─── Rutas desde features/ (nueva arquitectura canónica) ─────────────────────
import authRoutes    from './routes/auth.routes.js'        // features/auth → re-export
import productRoutes from './routes/product.routes.js'     // features/products → re-export
import orderRoutes   from './routes/order.routes.js'       // features/orders → re-export
import adminRoutes   from './features/admin/admin.routes.js'   // ← lógica propia extraída
import userRoutes    from './features/users/user.routes.js'    // ← lógica propia extraída
import contactRoutes from './features/contact/contact.routes.js' // ← lógica propia extraída
import uploadRoutes  from './features/upload/upload.routes.js'   // ← lógica propia extraída

// ─── Middleware de errores ────────────────────────────────────────────────────
import { errorHandler, notFound } from './middleware/error.middleware.js'

const app       = express()
const PORT      = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd    = process.env.NODE_ENV === 'production'

// ─── 1. Helmet — headers HTTP de seguridad ────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// ─── 2. CORS ─────────────────────────────────────────────────────────────────
const allowedOrigin = isProd
  ? process.env.CLIENT_URL
  : (process.env.CLIENT_URL || 'http://localhost:5173')

if (isProd && !allowedOrigin) {
  console.error('❌ FATAL: CLIENT_URL no está definido en producción.')
  process.exit(1)
}

app.use(cors({ origin: allowedOrigin, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'] }))

// ─── 3. Body parser con límite ───────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ─── 4. Rate limiting ────────────────────────────────────────────────────────
const limiterOpts = { standardHeaders: true, legacyHeaders: false }
app.use('/api/', rateLimit({ ...limiterOpts, windowMs: 15*60*1000, max: 300, message: { error: 'Demasiadas peticiones. Espera unos minutos.' } }))
app.use('/api/auth/login',    rateLimit({ ...limiterOpts, windowMs: 15*60*1000, max: 10,  message: { error: 'Demasiados intentos. Espera 15 minutos.' } }))
app.use('/api/auth/register', rateLimit({ ...limiterOpts, windowMs: 60*60*1000, max: 5,   message: { error: 'Demasiados registros. Espera una hora.' } }))
app.use('/api/contact',       rateLimit({ ...limiterOpts, windowMs: 60*60*1000, max: 10,  message: { error: 'Demasiados mensajes. Espera una hora.' } }))

// ─── Archivos estáticos — imágenes ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ─── Ruta de salud ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() }))

// ─── Rutas de la API ─────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/contact',  contactRoutes)
app.use('/api/upload',   uploadRoutes)

// ─── Manejo de errores ───────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── Inicio ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  TechStore API → http://localhost:${PORT}`)
  console.log(`📋  Entorno  : ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗  CORS     : ${allowedOrigin}`)
  console.log(`🛡️   Helmet   : activo | Rate limiting: activo`)
  console.log(`📁  Features : admin · users · contact · upload (extraídos)`)
  console.log(`📁  Features : auth · products · orders (barrel re-exports)\n`)
})
