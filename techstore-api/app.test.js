import { test, describe } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from './src/server.js'

describe('TechStore API', () => {
  test('GET /health responde 200 y JSON correcto', async () => {
    const response = await supertest(app).get('/health').expect(200)
    assert.strictEqual(response.body.status, 'ok')
    assert.ok(response.body.env)
    assert.ok(response.body.timestamp)
  })

  test('GET /api/products retorna un objeto con data y pagination', async () => {
    const response = await supertest(app).get('/api/products').expect(200)
    assert.ok(Array.isArray(response.body.data), 'data debe ser array')
    assert.ok(typeof response.body.pagination === 'object', 'pagination debe ser objeto')
    assert.ok(typeof response.body.pagination.page === 'number')
    assert.ok(typeof response.body.pagination.limit === 'number')
    assert.ok(typeof response.body.pagination.total === 'number')
  })

  test('GET /api/products/categories responde con array de categorías', async () => {
    const response = await supertest(app).get('/api/products/categories').expect(200)
    assert.ok(Array.isArray(response.body), 'debe retornar array')
    response.body.forEach((category) => {
      assert.ok(category.id || category.slug || category.name, 'categoría con campos esperados')
    })
  })

  test('GET /api/products/me/favorites sin token devuelve 401', async () => {
    await supertest(app).get('/api/products/me/favorites').expect(401)
  })
})

// ─── MÓDULO AUTH (crítico para bugs) ──────────────────────────────────────────
describe('Auth Module - Validaciones y errores', () => {
  test('POST /api/auth/register rechaza email inválido', async () => {
    const response = await supertest(app).post('/api/auth/register').send({
      email: 'no-es-email',
      password: 'Password123!',
      name: 'Test User'
    }).expect(400)
    assert.ok(response.body.error || response.body.errors, 'debe tener error validación')
  })

  test('POST /api/auth/register rechaza contraseña débil', async () => {
    const response = await supertest(app).post('/api/auth/register').send({
      email: 'user@test.com',
      password: '123',
      name: 'Test User'
    }).expect(400)
    assert.ok(response.body.error || response.body.errors, 'debe requerir password más fuerte')
  })

  test('POST /api/auth/register rechaza campos vacíos', async () => {
    const response = await supertest(app).post('/api/auth/register').send({
      email: '',
      password: '',
      name: ''
    }).expect(400)
    assert.ok(response.body.error || response.body.errors, 'debe validar campos requeridos')
  })

  test('POST /api/auth/login sin credenciales devuelve error', async () => {
    const response = await supertest(app).post('/api/auth/login').send({
      email: 'nonexistent@test.com',
      password: 'WrongPassword123!'
    }).expect(401)
    assert.ok(response.body.error, 'debe rechazar credenciales inválidas')
  })
})

// ─── MÓDULO PRODUCTS - FILTROS Y BÚSQUEDA (errores comunes) ─────────────────
describe('Products Module - Búsqueda y filtros', () => {
  test('GET /api/products?search=... devuelve array filtrado', async () => {
    const response = await supertest(app).get('/api/products?search=mouse').expect(200)
    assert.ok(Array.isArray(response.body.data), 'debe retornar array')
    assert.ok(typeof response.body.pagination.total === 'number')
  })

  test('GET /api/products?page=1&limit=5 respeta paginación', async () => {
    const response = await supertest(app).get('/api/products?page=1&limit=5').expect(200)
    assert.strictEqual(response.body.pagination.page, 1)
    assert.strictEqual(response.body.pagination.limit, 5)
    assert.ok(response.body.data.length <= 5, 'respeta límite de items')
  })

  test('GET /api/products?minPrice=100&maxPrice=500 filtra por precio', async () => {
    const response = await supertest(app).get('/api/products?minPrice=100&maxPrice=500').expect(200)
    response.body.data.forEach((product) => {
      assert.ok(product.price >= 100 && product.price <= 500, 'producto está en rango de precio')
    })
  })

  test('GET /api/products?category=... filtra por categoría', async () => {
    const response = await supertest(app).get('/api/products?category=perifericos').expect(200)
    assert.ok(Array.isArray(response.body.data), 'debe retornar array')
  })

  test('GET /api/products/:id con ID inválido retorna 404', async () => {
    await supertest(app).get('/api/products/invalid-id-xyz').expect(404)
  })
})

// ─── MÓDULO ADMIN - PERMISOS Y AUTORIZACIÓN (bugs de seguridad) ──────────────
describe('Admin Module - Control de acceso', () => {
  test('POST /api/admin/... sin token devuelve 401', async () => {
    const response = await supertest(app).post('/api/admin/users').expect(401)
    assert.strictEqual(response.status, 401)
  })

  test('POST /api/products sin token devuelve 401 (crear producto)', async () => {
    const response = await supertest(app).post('/api/products').send({
      name: 'Test Product',
      price: 100
    }).expect(401)
    assert.ok(response.body.error, 'debe requerir autenticación')
  })

  test('DELETE /api/products/:id sin token devuelve 401', async () => {
    await supertest(app).delete('/api/products/test-id').expect(401)
  })
})

// ─── MÓDULO ORDERS - VALIDACIONES DE ESTADO (errores transaccionales) ────────
describe('Orders Module - Validaciones', () => {
  test('GET /api/orders sin token devuelve 401', async () => {
    await supertest(app).get('/api/orders').expect(401)
  })

  test('POST /api/orders sin token devuelve 401 (requiere autenticación primero)', async () => {
    const response = await supertest(app).post('/api/orders').send({}).expect(401)
    assert.ok(response.body.error, 'debe rechazar por falta de token')
  })

  test('GET /api/orders/:id sin token devuelve 401', async () => {
    await supertest(app).get('/api/orders/test-order-id').expect(401)
  })
})

// ─── VALIDACIONES GENERALES DE API ────────────────────────────────────────────
describe('API Error Handling', () => {
  test('GET /ruta-inexistente devuelve 404', async () => {
    const response = await supertest(app).get('/api/ruta-que-no-existe').expect(404)
    assert.ok(response.body.error || response.body.message, 'debe reportar error 404')
  })

  test('POST con body inválido devuelve error de validación', async () => {
    const response = await supertest(app).post('/api/auth/register').send('invalid json').expect(400)
    assert.ok(response.status >= 400, 'debe ser error')
  })
})
