import { contactSchema } from './contact.validators.js'

export async function sendMessage(req, res, next) {
  try {
    const data = contactSchema.parse(req.body)

    // En producción: integrar con Nodemailer / Resend / SendGrid
    console.log('\n📩 Nuevo mensaje de contacto:')
    console.log(`  De:      ${data.name} <${data.email}>`)
    console.log(`  Asunto:  ${data.topic}`)
    console.log(`  Mensaje: ${data.message}\n`)

    res.status(201).json({
      message: 'Mensaje recibido. Te responderemos en menos de 24 horas.',
    })
  } catch (err) { next(err) }
}
