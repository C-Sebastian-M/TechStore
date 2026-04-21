// ─── AdminUsersService — I + S ────────────────────────────────────────────────
// I: quien solo necesita gestionar usuarios no recibe el contrato de pedidos ni categorías.
// S: una sola responsabilidad — administración de usuarios.

import prisma from '../../config/prisma.js'
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js'

export async function listUsers({ page = 1, limit = 20, search, role } = {}) {
  const where = {
    ...(search && { OR: [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]}),
    ...(role && { role }),
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
      select:  { id: true, email: true, name: true, phone: true, role: true, createdAt: true,
                 _count: { select: { orders: true, favorites: true } } },
    }),
    prisma.user.count({ where }),
  ])
  return { data: users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function getUserDetail(id) {
  const user = await prisma.user.findUnique({
    where:  { id },
    select: {
      id: true, email: true, name: true, phone: true, birthDate: true, role: true, createdAt: true,
      addresses: true,
      orders: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, orderNumber: true, total: true, status: true, createdAt: true, items: { select: { qty: true } } } },
      _count: { select: { orders: true } },
    },
  })
  if (!user) throw new NotFoundError('Usuario')
  return user
}

export async function changeUserRole(adminId, targetId, role) {
  if (targetId === adminId) throw new ValidationError('No puedes cambiar tu propio rol.')
  return prisma.user.update({
    where:  { id: targetId },
    data:   { role },
    select: { id: true, name: true, email: true, role: true },
  })
}

export async function removeUser(adminId, targetId) {
  if (targetId === adminId) throw new ValidationError('No puedes eliminar tu propia cuenta.')
  await prisma.user.delete({ where: { id: targetId } })
  return { message: 'Usuario eliminado correctamente.' }
}
