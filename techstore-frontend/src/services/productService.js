import api from './api.js'

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────

// Listar productos con filtros opcionales
// Parámetros: { page, limit, category, search, minPrice, maxPrice, sortBy, sortOrder }
export async function getProducts(params = {}) {
  // Construir query string solo con los params que tengan valor
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val)
    }
  })
  const qs = query.toString()
  return api.get(`/products${qs ? `?${qs}` : ''}`)
}

// Obtener un producto por ID
export async function getProductById(id) {
  return api.get(`/products/${id}`)
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

// Listar todas las categorías con conteo de productos
export async function getCategories() {
  return api.get('/products/categories')
}

// ─── FAVORITOS ────────────────────────────────────────────────────────────────

// Obtener productos favoritos del usuario autenticado
export async function getFavorites() {
  return api.get('/products/me/favorites')
}

// Agregar o quitar de favoritos (toggle)
// Devuelve { favorited: true/false, message: '...' }
export async function toggleFavorite(productId) {
  return api.post(`/products/${productId}/favorite`)
}
