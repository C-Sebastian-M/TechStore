// ─── ProfileService — S: una sola responsabilidad: gestión del perfil ────────────
// Separado de AuthService porque el perfil cambia por razones distintas al login.
// D: depende de PasswordService, no de bcrypt.

import prisma              from '../../config/prisma.js'
import { PasswordService } from '../../shared/utils/PasswordService.js'
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js'

const PUBLIC_USER_FIELDS = {
  id: true, email: true, name: true, phone: true,
  birthDate: true, role: true, googleAuth: true, createdAt: true,
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { ...PUBLIC_USER_FIELDS, addresses: true },
  })
  if (!user) throw new NotFoundError('Usuario')
  return user
}

export async function updateProfile(userId, data) {
  return prisma.user.update({ where: { id: userId }, data, select: PUBLIC_USER_FIELDS })
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('Usuario')

  const isMatch = await PasswordService.compare(currentPassword, user.password)
  if (!isMatch) throw new ValidationError('La contraseña actual es incorrecta.')

  const hashed = await PasswordService.hash(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  return { message: 'Contraseña actualizada correctamente.' }
}

export async function setPassword(userId, { newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('Usuario')
  if (!user.googleAuth) throw new ValidationError('Usa el formulario de cambio de contraseña normal.')

  const hashed = await PasswordService.hash(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed, googleAuth: false } })
  return { message: 'Contraseña establecida correctamente. Ya puedes iniciar sesión con email y contraseña.' }
}
