// ─── ContactService — S + O ───────────────────────────────────────────────────
// S: una sola responsabilidad: procesar mensajes de contacto.
// O: para agregar notificación por email real solo se extiende este servicio,
//    el controller no necesita cambios.

export const ContactService = {

  async processMessage({ name, email, topic, message }) {
    // En producción: sustituir el console.log por EmailService.sendContactNotification()
    // sin tocar el controller (principio O)
    console.log('\n📩 Nuevo mensaje de contacto:')
    console.log(`  De:      ${name} <${email}>`)
    console.log(`  Asunto:  ${topic}`)
    console.log(`  Mensaje: ${message}\n`)

    return { message: 'Mensaje recibido. Te responderemos en menos de 24 horas.' }
  },
}
