import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import prisma from '../config/prisma.js'

// ─── GENERAR TOKEN JWT ────────────────────────────────────────────────────────
// Duración reducida para producción.
// JWT_EXPIRES_IN en .env de producción debe ser '1d' o menos.
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  )
}

// ─── CAMPOS PÚBLICOS DEL USUARIO (nunca devolver el password) ─────────────────
const PUBLIC_USER_FIELDS = {
  id:        true,
  email:     true,
  name:      true,
  phone:     true,
  birthDate: true,
  role:      true,
  createdAt: true,
}

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
export async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Ya existe una cuenta con ese email.')
    err.statusCode = 409
    throw err
  }

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

  // Mensaje genérico: no revelar si el email existe o no
  const INVALID_MSG = 'Email o contraseña incorrectos.'

  if (!user) {
    // Hacer bcrypt.compare igualmente para evitar timing attacks
    // (si devolvemos inmediatamente cuando el email no existe,
    //  un atacante puede medir el tiempo de respuesta y saber si el email está registrado)
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
  await prisma.user.update({
    where: { id: userId },
    data:  { password: hashed },
  })

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
