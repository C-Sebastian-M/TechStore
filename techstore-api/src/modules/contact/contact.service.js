// ─── ContactService — S + O ───────────────────────────────────────────────────
// S: una sola responsabilidad: procesar mensajes de contacto.
// O: para agregar notificación por email real solo se extiende este servicio,
//    el controller no necesita cambios.

const isProd = process.env.NODE_ENV === 'production'

export const ContactService = {

  async processMessage({ name, email, topic, message }) {
    // En desarrollo: loguear en consola del servidor (no visible al cliente)
    // En producción: aquí se conectaría EmailService.sendContactNotification()
    if (!isProd) {
      console.log('\n📩 [DEV] Nuevo mensaje de contacto:')
      console.log(`  De:      ${name} <${email}>`)
      console.log(`  Asunto:  ${topic}`)
      console.log(`  Mensaje: ${message}\n`)
    }

    return { message: 'Mensaje recibido. Te responderemos en menos de 24 horas.' }
  },
}
