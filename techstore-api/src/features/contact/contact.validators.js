import { z } from 'zod'

// ─── VALIDACIÓN ───────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name:    z.string().min(2,  'El nombre es requerido').max(100),
  email:   z.string().email('Correo inválido'),
  topic:   z.string().min(1,  'El asunto es requerido').max(100),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(500),
})
