import prisma from '../../config/prisma.js'

// ─── LISTAR PRODUCTOS ─────────────────────────────────────────────────────────
export async function getProducts({ page, limit, category, search, minPrice, maxPrice, sortBy, sortOrder, includeInactive = false, isActive }) {
  const skip  = (page - 1) * limit
  const where = {
    ...(isActive !== undefined
      ? { isActive }
      : includeInactive ? {} : { isActive: true }
    ),
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { name:        { contains: search, mode: 'insensitive' } },
        { brand:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    pagination: {
      total, page, limit,
      totalPages: Math.ceil(total / limit),
      hasNext:    page < Math.ceil(total / limit),
      hasPrev:    page > 1,
    },
  }
}

// ─── OBTENER UN PRODUCTO ──────────────────────────────────────────────────────
export async function getProductById(id) {
  const product = await prisma.product.findFirst({
    where:   { id, isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  })
  if (!product) {
    const err = new Error('Producto no encontrado.')
    err.statusCode = 404
    throw err
  }
  return product
}

// ─── CRUD ADMIN ───────────────────────────────────────────────────────────────
export async function createProduct(data) {
  return prisma.product.create({
    data,
    include: { category: { select: { name: true, slug: true } } },
  })
}

export async function updateProduct(id, data) {
  const exists = await prisma.product.findUnique({ where: { id } })
  if (!exists) {
    const err = new Error('Producto no encontrado.')
    err.statusCode = 404
    throw err
  }
  return prisma.product.update({
    where:   { id },
    data,
    include: { category: { select: { name: true, slug: true } } },
  })
}

export async function deleteProduct(id) {
  const exists = await prisma.product.findUnique({ where: { id } })
  if (!exists) {
    const err = new Error('Producto no encontrado.')
    err.statusCode = 404
    throw err
  }
  await prisma.product.update({ where: { id }, data: { isActive: false } })
  return { message: 'Producto desactivado correctamente.' }
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
export async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { name: 'asc' },
  })
}

// ─── FAVORITOS ────────────────────────────────────────────────────────────────
export async function getFavorites(userId) {
  const favorites = await prisma.favorite.findMany({
    where:   { userId },
    include: { product: { include: { category: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return favorites.map(f => f.product)
}

export async function toggleFavorite(userId, productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    const err = new Error('Producto no encontrado.')
    err.statusCode = 404
    throw err
  }
  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
  })
  if (existing) {
    await prisma.favorite.delete({ where: { userId_productId: { userId, productId } } })
    return { favorited: false, message: 'Eliminado de favoritos.' }
  }
  await prisma.favorite.create({ data: { userId, productId } })
  return { favorited: true, message: 'Agregado a favoritos.' }
}
