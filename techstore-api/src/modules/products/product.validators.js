import { z } from 'zod'

// ─── QUERY PARAMS — listado de productos ─────────────────────────────────────
export const productQuerySchema = z.object({
  page:            z.coerce.number().int().min(1).default(1),
  limit:           z.coerce.number().int().min(1).max(100).default(12),
  category:        z.string().max(100).optional(),
  search:          z.string().max(100).optional(),
  minPrice:        z.coerce.number().min(0).optional(),
  maxPrice:        z.coerce.number().min(0).optional(),
  sortBy:          z.enum(['price', 'rating', 'name', 'createdAt']).default('createdAt'),
  sortOrder:       z.enum(['asc', 'desc']).default('desc'),
  includeInactive: z.coerce.boolean().default(false),
  isActive:        z.coerce.boolean().optional(),
})

// ─── CREAR / ACTUALIZAR PRODUCTO ──────────────────────────────────────────────
export const productSchema = z.object({
  name:        z.string().min(3, 'El nombre es requerido').max(200),
  brand:       z.string().min(1, 'La marca es requerida').max(100),
  description: z.string().min(10, 'La descripción es requerida').max(5000),
  price:       z.number().positive('El precio debe ser mayor a 0').max(99999),
  oldPrice:    z.number().positive().max(99999).optional().nullable(),
  stock:       z.number().int().min(0).max(99999).default(0),
  image:       z.string().url().max(2000).optional().nullable(),
  badge:       z.string().max(20).optional().nullable(),
  badgeColor:  z.string().max(50).optional().nullable(),
  specs:       z.array(z.string().max(200)).max(30).default([]),
  categoryId:  z.string().min(1, 'La categoría es requerida').max(100),
  isActive:    z.boolean().default(true),
})
