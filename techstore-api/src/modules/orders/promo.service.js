// ─── PromoService — S: gestión de códigos promocionales ──────────────────────
// Reemplaza el objeto literal PROMO_CODES hardcodeado en order.service.js.
// Los promos ahora se crean, editan y desactivan desde el panel de admin
// sin necesidad de redeploy.

import prisma from '../../config/prisma.js'
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js'

// Obtener el descuento de un código — retorna 0 si no aplica
export async function getDiscount(code) {
  if (!code) return 0

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  })

  if (!promo || !promo.isActive)                         return 0
  if (promo.expiresAt && promo.expiresAt < new Date())   return 0
  if (promo.maxUses   && promo.usedCount >= promo.maxUses) return 0

  return promo.discount
}

// Incrementar el uso del código al confirmar un pedido
export async function incrementUsage(code) {
  if (!code) return
  await prisma.promoCode.update({
    where: { code: code.toUpperCase().trim() },
    data:  { usedCount: { increment: 1 } },
  }).catch(() => { /* si el código ya no existe, ignorar */ })
}

// ─── CRUD admin ───────────────────────────────────────────────────────────────
export async function listPromoCodes() {
  return prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function createPromoCode({ code, discount, maxUses, expiresAt }) {
  const existing = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  })
  if (existing) throw new ValidationError(`El código ${code.toUpperCase()} ya existe.`)

  return prisma.promoCode.create({
    data: {
      code:      code.toUpperCase().trim(),
      discount,
      maxUses:   maxUses  || null,
      expiresAt: expiresAt || null,
    },
  })
}

export async function updatePromoCode(id, data) {
  const promo = await prisma.promoCode.findUnique({ where: { id } })
  if (!promo) throw new NotFoundError('Código promocional')
  return prisma.promoCode.update({ where: { id }, data })
}

export async function deletePromoCode(id) {
  const promo = await prisma.promoCode.findUnique({ where: { id } })
  if (!promo) throw new NotFoundError('Código promocional')
  await prisma.promoCode.delete({ where: { id } })
  return { message: 'Código eliminado.' }
}
