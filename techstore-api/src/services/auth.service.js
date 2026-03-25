import bcrypt             from 'bcryptjs'
import jwt                from 'jsonwebtoken'
import { OAuth2Client }   from 'google-auth-library'
import prisma             from '../config/prisma.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ─── GENERAR TOKEN JWT ────────────────────────────────────────────────────────
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  )
}

// ─── SETEAR COOKIE httpOnly — protege el JWT contra XSS ──────────────────────
// También se envía el token en el body para que el cliente conozca user/role.
export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('token', token, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   24 * 60 * 60 * 1000,
    path:     '/',
  })
}

// ─── CAMPOS PÚBLICOS DEL USUARIO ─────────────────────────────────────────────
const PUBLIC_USER_FIELDS = {
  id:         true,
  email:      true,
  name:       true,
  phone:      true,
  birthDate:  true,
  role:       true,
  googleAuth: true,
  createdAt:  true,
}

// ─── VERIFICAR RECAPTCHA v3 ───────────────────────────────────────────────────
const RECAPTCHA_THRESHOLD = 0.5

export async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.warn('RECAPTCHA_SECRET_KEY no configurado — omitiendo verificación')
    return true
  }
  const res  = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `secret=${secret}&response=${token}`,
  })
  const data = await res.json()
  if (!data.success || data.score < RECAPTCHA_THRESHOLD) {
    const err = new Error('Verificación de seguridad fallida. Intenta de nuevo.')
    err.statusCode = 403
    throw err
  }
  return true
}

// ─── PASO 1: ENVIAR CÓDIGO DE VERIFICACIÓN ───────────────────────────────────
export async function sendVerificationCode({ name, email, password, recaptchaToken }) {
  // 1. Verificar reCAPTCHA
  await verifyRecaptcha(recaptchaToken)

  // 2. Verificar que el email no esté ya registrado
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Ya existe una cuenta con ese email.')
    err.statusCode = 409
    throw err
  }

  // 3. Rate limit por email: esperar 60 segundos entre reenvíos
  const pending = await prisma.emailVerification.findUnique({ where: { email } })
  if (pending) {
    const secondsSinceSent = (Date.now() - new Date(pending.createdAt).getTime()) / 1000
    if (secondsSinceSent < 60) {
      const wait = Math.ceil(60 - secondsSinceSent)
      const err  = new Error(`Espera ${wait} segundo${wait !== 1 ? 's' : ''} antes de solicitar un nuevo código.`)
      err.statusCode = 429
      throw err
    }
  }

  // 4. Generar código y guardar en BD (upsert — resetea intentos fallidos)
  const code           = String(Math.floor(100000 + Math.random() * 900000))
  const hashedPassword = await bcrypt.hash(password, 10)
  const expiresAt      = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.emailVerification.upsert({
    where:  { email },
    update: { name, password: hashedPassword, code, expiresAt, attempts: 0 },
    create: { email, name, password: hashedPassword, code, expiresAt },
  })

  // 5. Enviar email con el código
  const { sendVerificationCode: sendEmail } = await import('./email.service.js')
  await sendEmail(email, name, code)

  return { message: 'Código enviado. Revisa tu correo.' }
}

// ─── PASO 2: VERIFICAR CÓDIGO Y CREAR CUENTA ─────────────────────────────────
const MAX_VERIFY_ATTEMPTS = 5

export async function verifyCodeAndRegister({ email, code }) {
  const record = await prisma.emailVerification.findUnique({ where: { email } })

  if (!record) {
    const err = new Error('No hay verificación pendiente para este email.')
    err.statusCode = 400
    throw err
  }

  if (new Date() > record.expiresAt) {
    await prisma.emailVerification.delete({ where: { email } })
    const err = new Error('El código expiró. Solicita uno nuevo.')
    err.statusCode = 400
    throw err
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await prisma.emailVerification.delete({ where: { email } })
    const err = new Error('Demasiados intentos fallidos. Solicita un nuevo código.')
    err.statusCode = 429
    throw err
  }

  if (record.code !== code.trim()) {
    await prisma.emailVerification.update({
      where: { email },
      data:  { attempts: { increment: 1 } },
    })
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts - 1
    const err = new Error(
      remaining > 0
        ? `Código incorrecto. Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''}.`
        : 'Código incorrecto. Se agotaron los intentos, solicita uno nuevo.'
    )
    err.statusCode = 400
    throw err
  }

  // Código correcto — crear usuario y limpiar verificación en una transacción
  const [user] = await prisma.$transaction([
    prisma.user.create({
      data:   { name: record.name, email, password: record.password },
      select: PUBLIC_USER_FIELDS,
    }),
    prisma.emailVerification.delete({ where: { email } }),
  ])

  const token = generateToken(user.id)
  return { user, token }
}

// Alias de compatibilidad
export const register = sendVerificationCode

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const user        = await prisma.user.findUnique({ where: { email } })
  const INVALID_MSG = 'Email o contraseña incorrectos.'

  if (!user) {
    await bcrypt.compare(password, '$2b$10$invalidhashplaceholderfortimingg')
    const err = new Error(INVALID_MSG)
    err.statusCode = 401
    throw err
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    const err = new Error(INVALID_MSG)
    err.statusCode = 401
    throw err
  }

  const { password: _pw, ...publicUser } = user
  const token = generateToken(user.id)
  return { user: publicUser, token }
}

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
// Verificación con google-auth-library (oficial) en lugar del endpoint deprecado tokeninfo
export async function loginWithGoogle(credential) {
  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch {
    const err = new Error('Token de Google inválido.')
    err.statusCode = 401
    throw err
  }

  if (!payload?.email_verified) {
    const err = new Error('El correo de Google no está verificado.')
    err.statusCode = 401
    throw err
  }

  const email = payload.email.toLowerCase()
  const name  = payload.name || payload.given_name || email.split('@')[0]

  let user = await prisma.user.findUnique({
    where:  { email },
    select: PUBLIC_USER_FIELDS,
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleAuth: true,
        password:   await bcrypt.hash(Math.random().toString(36) + Date.now(), 10),
      },
      select: PUBLIC_USER_FIELDS,
    })
  }

  const token = generateToken(user.id)
  return { user, token }
}

// ─── OBTENER PERFIL ───────────────────────────────────────────────────────────
export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { ...PUBLIC_USER_FIELDS, addresses: true },
  })
  if (!user) {
    const err = new Error('Usuario no encontrado.')
    err.statusCode = 404
    throw err
  }
  return user
}

// ─── ACTUALIZAR PERFIL ────────────────────────────────────────────────────────
export async function updateProfile(userId, data) {
  return prisma.user.update({
    where:  { id: userId },
    data,
    select: PUBLIC_USER_FIELDS,
  })
}

// ─── CAMBIAR CONTRASEÑA ───────────────────────────────────────────────────────
export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const err = new Error('Usuario no encontrado.')
    err.statusCode = 404
    throw err
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    const err = new Error('La contraseña actual es incorrecta.')
    err.statusCode = 400
    throw err
  }
  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  return { message: 'Contraseña actualizada correctamente.' }
}

// ─── GESTIÓN DE DIRECCIONES ───────────────────────────────────────────────────
export async function addAddress(userId, data) {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
  }
  return prisma.address.create({ data: { ...data, userId } })
}

export async function updateAddress(userId, addressId, data) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } })
  if (!address) {
    const err = new Error('Dirección no encontrada.')
    err.statusCode = 404
    throw err
  }
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
  }
  return prisma.address.update({ where: { id: addressId }, data })
}

// ─── ESTABLECER CONTRASEÑA (para usuarios de Google que no tienen una) ────────────
export async function setPassword(userId, { newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const err = new Error('Usuario no encontrado.')
    err.statusCode = 404
    throw err
  }
  if (!user.googleAuth) {
    const err = new Error('Usa el formulario de cambio de contraseña normal.')
    err.statusCode = 400
    throw err
  }
  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: userId },
    data:  { password: hashed, googleAuth: false },  // ya tiene contraseña propia
  })
  return { message: 'Contraseña establecida correctamente. Ya puedes iniciar sesión con email y contraseña.' }
}

export async function deleteAddress(userId, addressId) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } })
  if (!address) {
    const err = new Error('Dirección no encontrada.')
    err.statusCode = 404
    throw err
  }
  await prisma.address.delete({ where: { id: addressId } })
  return { message: 'Dirección eliminada.' }
}
