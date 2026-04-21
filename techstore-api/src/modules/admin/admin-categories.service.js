// ─── AdminCategoriesService — I + S ──────────────────────────────────────────────
// I: quien solo necesita gestionar categorías no recibe el contrato de usuarios ni pedidos.
// S: una sola responsabilidad — administración de categorías.

import prisma from '../../config/prisma.js'
import { ValidationError } from '../../shared/errors/AppError.js'

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })
}

export async function createCategory(data) {
  return prisma.category.create({ data })
}

export async function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data })
}

export async function deleteCategory(id) {
  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    throw new ValidationError(`No se puede eliminar: tiene ${count} producto(s) asociados.`)
  }
  await prisma.category.delete({ where: { id } })
  return { message: 'Categoría eliminada.' }
}
