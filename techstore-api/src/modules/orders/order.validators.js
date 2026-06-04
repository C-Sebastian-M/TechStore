import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(100),
        qty: z.number().int().min(1).max(5),
      }),
    )
    .min(1, "El pedido debe tener al menos un producto")
    .max(20),

  shipping: z.object({
    fullName: z.string().min(2).max(100),
    address: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    postalCode: z.string().max(20).optional().nullable(),
    country: z.string().max(100).default("Colombia"),
  }),

  paymentMethod: z.enum(["card", "paypal"]).default("card"),
  promoCode: z.string().max(50).optional().nullable(),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "RECEIVED",
    "PAYMENT_CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().optional(),
});
