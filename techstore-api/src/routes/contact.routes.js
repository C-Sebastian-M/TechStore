import { Router } from 'express'
import { z }      from 'zod'

const router = Router()

const contactSchema = z.object({
  name:    z.string().min(2, 'El nombre es requerido').max(100),
  email:   z.string().email('Correo inválido'),
  topic:   z.string().min(1, 'El asunto es requerido').max(100),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(500),
})

// ─── POST /api/contact ────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body)

    // Por ahora loguea el mensaje en consola.
    // En producción aquí iría la integración con SendGrid, Resend, etc.
    console.log('\n📩 Nuevo mensaje de contacto:')
    console.log(`  De:      ${data.name} <${data.email}>`)
    console.log(`  Asunto:  ${data.topic}`)
    console.log(`  Mensaje: ${data.message}\n`)

    res.status(201).json({
      message: 'Mensaje recibido. Te responderemos en menos de 24 horas.',
    })
  } catch (err) {
    next(err)
  }
})

export default router
