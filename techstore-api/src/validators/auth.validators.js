import { z } from 'zod'

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name:     z.string()
    .min(2,   'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .trim(),
  email:    z.string()
    .email('Email inválido')
    .max(254, 'Email demasiado largo')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8,   'La contraseña debe tener al menos 8 caracteres')
    .max(72,  'La contraseña no puede superar 72 caracteres')
    .regex(/\d/, 'La contraseña debe contener al menos un número'),
  recaptchaToken: z.string().min(1, 'Token reCAPTCHA requerido'),
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

// ─── VERIFICAR CÓDIGO DE EMAIL ──────────────────────────────────────────────
export const verifyCodeSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
  code:  z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d{6}$/, 'Solo dígitos'),
})

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Token de Google requerido'),
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

// Para usuarios de Google que nunca tuvieron contraseña
export const setPasswordSchema = z.object({
  newPassword: z.string()
    .min(8,  'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres')
    .regex(/\d/, 'La contraseña debe contener al menos un número'),
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
