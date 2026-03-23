import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import prisma from '../config/prisma.js'

// ─── GENERAR TOKEN JWT ────────────────────────────────────────────────────────
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  )
}

// ─── CAMPOS PÚBLICOS DEL USUARIO ──────────────────────────────────────────────
const PUBLIC_USER_FIELDS = {
  id:        true,
  email:     true,
  name:      true,
  phone:     true,
  birthDate: true,
  role:      true,
  createdAt: true,
}

// ─── VERIFICAR RECAPTCHA v3 ───────────────────────────────────────────────────
// Score mínimo: 0.5 (0.0 = bot seguro, 1.0 = humano seguro)
const RECAPTCHA_THRESHOLD = 0.5

export async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    // Si no hay secret configurado (dev local sin .env), omitir verificación
    console.warn('⚠️  RECAPTCHA_SECRET_KEY no configurado — omitiendo verificación')
    return true
  }

  const res  = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
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

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
export async function register({ name, email, password, recaptchaToken }) {
  // 1. Verificar reCAPTCHA
  await verifyRecaptcha(recaptchaToken)

  // 2. Verificar email único
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Ya existe una cuenta con ese email.')
    err.statusCode = 409
    throw err
  }

  // 3. Hashear contraseña y crear usuario
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data:   { name, email, password: hashedPassword },
    select: PUBLIC_USER_FIELDS,
  })

  const token = generateToken(user.id)
  return { user, token }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
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
// Verifica el ID token de Google y crea o recupera el usuario.
// Si el email ya existe con cuenta normal, vincula la sesión.
export async function loginWithGoogle(credential) {
  // Verificar el token con la API de Google
  const res  = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
  const data = await res.json()

  if (data.error || !data.email_verified) {
    const err = new Error('Token de Google inválido.')
    err.statusCode = 401
    throw err
  }

  // Verificar que el token fue emitido para nuestra app
  if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
    const err = new Error('Token de Google no corresponde a esta aplicación.')
    err.statusCode = 401
    throw err
  }

  const email = data.email.toLowerCase()
  const name  = data.name || data.given_name || email.split('@')[0]

  // Buscar o crear usuario
  let user = await prisma.user.findUnique({
    where:  { email },
    select: PUBLIC_USER_FIELDS,
  })

  if (!user) {
    // Nuevo usuario — crear con password vacío (no puede hacer login con email/pass)
    user = await prisma.user.create({
      data: {
        email,
        name,
        // Password inutilizable — solo puede autenticarse con Google
        password: await bcrypt.hash(Math.random().toString(36), 10),
      },
      select: PUBLIC_USER_FIELDS,
    })
  }

  const token = generateToken(user.id)
  return { user, token }
}

// ─── OBTENER PERFIL PROPIO ────────────────────────────────────────────────────
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
