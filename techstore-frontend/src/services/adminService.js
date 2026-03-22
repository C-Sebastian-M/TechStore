import api from './api.js'

// ─── UPLOAD DE IMAGEN ──────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const getToken = () => localStorage.getItem('techstore_token')

/**
 * Sube una imagen al servidor.
 * @param {File} file  Archivo seleccionado por el usuario
 * @returns {Promise<string>} URL pública de la imagen (ej: '/uploads/products/prod_xxx.webp')
 */
export async function uploadProductImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${BASE_URL}/upload/product-image`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body:    formData,
    // NO incluir Content-Type — el navegador lo pone automáticamente con boundary
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'Error al subir la imagen.')
  // Convertir a URL absoluta apuntando al servidor del backend
  const serverBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '')
  return `${serverBase}${data.url}`
}

/**
 * Elimina una imagen subida del servidor.
 * @param {string} url  URL absoluta de la imagen
 */
export async function deleteProductImage(url) {
  // Extraer la ruta relativa (/uploads/products/...)
  const serverBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '')
  const relativeUrl = url.replace(serverBase, '')
  await api.delete('/upload/product-image', { url: relativeUrl })
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/admin/dashboard')

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────
export const getAdminProducts = (params = {}) => {
  // El admin siempre incluye productos inactivos en su vista
  const merged = { includeInactive: true, ...params }
  const q = new URLSearchParams()
  Object.entries(merged).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, v) })
  const qs = q.toString()
  return api.get(`/products${qs ? `?${qs}` : ''}`)
}
export const getAdminProduct  = (id)   => api.get(`/products/${id}`)
export const createProduct    = (data) => api.post('/products', data)
export const updateProduct    = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct    = (id)   => api.delete(`/products/${id}`)

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
export const getAdminCategories = ()         => api.get('/admin/categories')
export const createCategory     = (data)     => api.post('/admin/categories', data)
export const updateCategory     = (id, data) => api.put(`/admin/categories/${id}`, data)
export const deleteCategory     = (id)       => api.delete(`/admin/categories/${id}`)

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────
export const getAdminOrders = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, v) })
  return api.get(`/admin/orders?${q.toString()}`)
}
export const getAdminOrder    = (id)           => api.get(`/admin/orders/${id}`)
export const updateOrderStatus = (id, status)  => api.patch(`/admin/orders/${id}/status`, { status })

// ─── USUARIOS ─────────────────────────────────────────────────────────────────
export const getAdminUsers  = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, v) })
  return api.get(`/admin/users?${q.toString()}`)
}
export const getAdminUser   = (id)           => api.get(`/admin/users/${id}`)
export const updateUserRole = (id, role)     => api.patch(`/admin/users/${id}/role`, { role })
export const deleteUser     = (id)           => api.delete(`/admin/users/${id}`)
