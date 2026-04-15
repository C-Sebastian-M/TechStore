import * as productService from './product.service.js'
import { productQuerySchema, productSchema } from './product.validators.js'

export async function getProducts(req, res, next) {
  try {
    const query = productQuerySchema.parse(req.query)
    if (req.user?.role !== 'ADMIN') {
      query.includeInactive = false
      delete query.isActive
    }
    const result = await productService.getProducts(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await productService.getCategories()
    res.json(categories)
  } catch (err) { next(err) }
}

export async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id)
    res.json(product)
  } catch (err) { next(err) }
}

export async function createProduct(req, res, next) {
  try {
    const data    = productSchema.parse(req.body)
    const product = await productService.createProduct(data)
    res.status(201).json(product)
  } catch (err) { next(err) }
}

export async function updateProduct(req, res, next) {
  try {
    const data    = productSchema.partial().parse(req.body)
    const product = await productService.updateProduct(req.params.id, data)
    res.json(product)
  } catch (err) { next(err) }
}

export async function deleteProduct(req, res, next) {
  try {
    const result = await productService.deleteProduct(req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getFavorites(req, res, next) {
  try {
    const favorites = await productService.getFavorites(req.user.id)
    res.json(favorites)
  } catch (err) { next(err) }
}

export async function toggleFavorite(req, res, next) {
  try {
    const result = await productService.toggleFavorite(req.user.id, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}
