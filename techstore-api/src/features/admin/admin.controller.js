import { z }   from 'zod'
import * as adminService from './admin.service.js'

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export async function getDashboard(req, res, next) {
  try {
    const data = await adminService.getDashboardStats()
    res.json(data)
  } catch (err) { next(err) }
}

// ─── USUARIOS ─────────────────────────────────────────────────────────────────
export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search, role } = z.object({
      page:   z.coerce.number().default(1),
      limit:  z.coerce.number().default(20),
      search: z.string().optional(),
      role:   z.enum(['CUSTOMER', 'ADMIN']).optional(),
    }).parse(req.query)
    const result = await adminService.listUsers({ page, limit, search, role })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getUser(req, res, next) {
  try {
    const user = await adminService.getUserDetail(req.params.id)
    res.json(user)
  } catch (err) { next(err) }
}

export async function patchUserRole(req, res, next) {
  try {
    const { role } = z.object({ role: z.enum(['CUSTOMER', 'ADMIN']) }).parse(req.body)
    const user = await adminService.changeUserRole(req.user.id, req.params.id, role)
    res.json(user)
  } catch (err) { next(err) }
}

export async function deleteUser(req, res, next) {
  try {
    const result = await adminService.removeUser(req.user.id, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
const categorySchema = z.object({
  name:  z.string().min(2),
  slug:  z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  image: z.string().url().optional().nullable(),
})

export async function getCategories(req, res, next) {
  try { res.json(await adminService.listCategories()) } catch (err) { next(err) }
}

export async function postCategory(req, res, next) {
  try {
    const data = categorySchema.parse(req.body)
    res.status(201).json(await adminService.createCategory(data))
  } catch (err) { next(err) }
}

export async function putCategory(req, res, next) {
  try {
    const data = categorySchema.partial().parse(req.body)
    res.json(await adminService.updateCategory(req.params.id, data))
  } catch (err) { next(err) }
}

export async function deleteCategory(req, res, next) {
  try {
    res.json(await adminService.deleteCategory(req.params.id))
  } catch (err) { next(err) }
}

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────
export async function getOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status, search } = z.object({
      page:   z.coerce.number().default(1),
      limit:  z.coerce.number().default(20),
      status: z.string().optional(),
      search: z.string().optional(),
    }).parse(req.query)
    const result = await adminService.listAllOrders({ page, limit, status, search })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getOrder(req, res, next) {
  try {
    res.json(await adminService.getOrderDetail(req.params.id))
  } catch (err) { next(err) }
}

export async function patchOrderStatus(req, res, next) {
  try {
    const { status } = z.object({
      status: z.enum(['RECEIVED','PAYMENT_CONFIRMED','PREPARING','SHIPPED','DELIVERED','CANCELLED']),
    }).parse(req.body)
    res.json(await adminService.setOrderStatus(req.params.id, status))
  } catch (err) { next(err) }
}
