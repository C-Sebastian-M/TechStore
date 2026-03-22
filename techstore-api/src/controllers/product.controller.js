import * as productService from '../services/product.service.js'
import { productQuerySchema, productSchema } from '../validators/product.validators.js'

// ─── GET /api/products ────────────────────────────────────────────────────────
export async function getProducts(req, res, next) {
  try {
    const query = productQuerySchema.parse(req.query)
    // Solo un admin puede ver productos inactivos
    if (req.user?.role !== 'ADMIN') {
      query.includeInactive = false
      delete query.isActive  // clientes siempre ven solo activos
    }
    const result = await productService.getProducts(query)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── GET /api/products/categories ────────────────────────────────────────────
export async function getCategories(req, res, next) {
  try {
    const categories = await productService.getCategories()
    res.json(categories)
  } catch (err) { next(err) }
}

// ─── GET /api/products/:id ────────────────────────────────────────────────────
export async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id)
    res.json(product)
  } catch (err) { next(err) }
}

// ─── POST /api/products (admin) ───────────────────────────────────────────────
export async function createProduct(req, res, next) {
  try {
    const data    = productSchema.parse(req.body)
    const product = await productService.createProduct(data)
    res.status(201).json(product)
  } catch (err) { next(err) }
}

// ─── PUT /api/products/:id (admin) ────────────────────────────────────────────
export async function updateProduct(req, res, next) {
  try {
    const data    = productSchema.partial().parse(req.body)
    const product = await productService.updateProduct(req.params.id, data)
    res.json(product)
  } catch (err) { next(err) }
}

// ─── DELETE /api/products/:id (admin) ─────────────────────────────────────────
export async function deleteProduct(req, res, next) {
  try {
    const result = await productService.deleteProduct(req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── GET /api/products/favorites ─────────────────────────────────────────────
export async function getFavorites(req, res, next) {
  try {
    const favorites = await productService.getFavorites(req.user.id)
    res.json(favorites)
  } catch (err) { next(err) }
}

// ─── POST /api/products/:id/favorite ─────────────────────────────────────────
export async function toggleFavorite(req, res, next) {
  try {
    const result = await productService.toggleFavorite(req.user.id, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}
