import * as orderService from '../services/order.service.js'
import { createOrderSchema } from '../validators/product.validators.js'
import { z } from 'zod'

// ─── POST /api/orders ─────────────────────────────────────────────────────────
export async function createOrder(req, res, next) {
  try {
    const data  = createOrderSchema.parse(req.body)
    const order = await orderService.createOrder(req.user.id, data)
    res.status(201).json(order)
  } catch (err) { next(err) }
}

// ─── GET /api/orders ─────────────────────────────────────────────────────────
export async function getMyOrders(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query
    const result = await orderService.getOrdersByUser(req.user.id, {
      page:  Math.max(1, parseInt(page)  || 1),
      limit: Math.min(50, parseInt(limit) || 20),  // máx 50 por página
    })
    res.json(result)
  } catch (err) { next(err) }
}

// ─── GET /api/orders/:id ─────────────────────────────────────────────────────
export async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id)
    res.json(order)
  } catch (err) { next(err) }
}

// ─── GET /api/orders/admin (admin) ────────────────────────────────────────────
export async function getAllOrders(req, res, next) {
  try {
    const query = z.object({
      page:   z.coerce.number().default(1),
      limit:  z.coerce.number().default(20),
      status: z.string().optional(),
    }).parse(req.query)
    const result = await orderService.getAllOrders(query)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── PATCH /api/orders/:id/status (admin) ─────────────────────────────────────
export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = z.object({
      status: z.enum(['RECEIVED','PAYMENT_CONFIRMED','PREPARING','SHIPPED','DELIVERED','CANCELLED'])
    }).parse(req.body)

    const order = await orderService.updateOrderStatus(req.params.id, status)
    res.json(order)
  } catch (err) { next(err) }
}
