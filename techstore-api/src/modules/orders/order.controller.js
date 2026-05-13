import * as orderService from "./order.service.js";
import {
  createOrderSchema,
  orderStatusSchema,
  paginationSchema,
} from "./order.validators.js";

export async function createOrder(req, res, next) {
  try {
    const data = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(req.user.id, data);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await orderService.getOrdersByUser(req.user.id, {
      page,
      limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const { page, limit, status } = paginationSchema.parse(req.query);
    const result = await orderService.getAllOrders({ page, limit, status });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = orderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err) {
    next(err);
  }
}
