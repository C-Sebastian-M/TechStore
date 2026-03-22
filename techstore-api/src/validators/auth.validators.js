import { z } from 'zod'

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
// Contraseña: mínimo 8 caracteres, al menos 1 número.
// En producción siempre exigir más que un mínimo de 6 caracteres simples.
export const registerSchema = z.object({
  name:     z.string()
    .min(2,   'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .trim(),
  email:    z.string()
    .email('Email inválido')
    .max(254, 'Email demasiado largo')   // 254 es el límite RFC del email
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8,   'La contraseña debe tener al menos 8 caracteres')
    .max(72,  'La contraseña no puede superar 72 caracteres')  // límite de bcrypt
    .regex(/\d/, 'La contraseña debe contener al menos un número'),
})

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string()
    .email('Email inválido')
    .max(254)
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1,  'La contraseña es requerida')
    .max(72, 'Contraseña inválida'),
})

// ─── ACTUALIZAR PERFIL ────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name:      z.string().min(2).max(100).trim().optional(),
  phone:     z.string().max(30).optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
})

// ─── CAMBIAR CONTRASEÑA ───────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1,  'Contraseña actual requerida')
    .max(72),
  newPassword: z.string()
    .min(8,  'La nueva contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres')
    .regex(/\d/, 'La nueva contraseña debe contener al menos un número'),
})

// ─── DIRECCIÓN ────────────────────────────────────────────────────────────────
export const addressSchema = z.object({
  label:      z.string().max(50).default('Casa'),
  fullName:   z.string().min(2,  'El nombre completo es requerido').max(100),
  address:    z.string().min(5,  'La dirección es requerida').max(200),
  city:       z.string().min(2,  'La ciudad es requerida').max(100),
  postalCode: z.string().max(20).optional().nullable(),
  country:    z.string().max(100).default('Colombia'),
  isDefault:  z.boolean().default(false),
})
