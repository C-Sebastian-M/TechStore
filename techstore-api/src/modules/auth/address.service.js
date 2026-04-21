// ─── AddressService — S: una sola responsabilidad: gestión de direcciones ────────
// Separado de ProfileService porque las direcciones cambian por razones distintas al perfil.

import prisma from '../../config/prisma.js'
import { NotFoundError } from '../../shared/errors/AppError.js'

export async function addAddress(userId, data) {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
  }
  return prisma.address.create({ data: { ...data, userId } })
}

export async function updateAddress(userId, addressId, data) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } })
  if (!address) throw new NotFoundError('Dirección')
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
  }
  return prisma.address.update({ where: { id: addressId }, data })
}

export async function deleteAddress(userId, addressId) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } })
  if (!address) throw new NotFoundError('Dirección')
  await prisma.address.delete({ where: { id: addressId } })
  return { message: 'Dirección eliminada.' }
}
