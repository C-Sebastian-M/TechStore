// ─── RecaptchaService — S: solo verifica tokens reCAPTCHA ────────────────────────
// O: para cambiar a hCaptcha o Turnstile solo se modifica este archivo,
//    los consumidores (auth.service) no saben qué proveedor se usa.

import { ForbiddenError } from '../../shared/errors/AppError.js'

const THRESHOLD = 0.5

export const RecaptchaService = {
  async verify(token) {
    const secret = process.env.RECAPTCHA_SECRET_KEY
    if (!secret) {
      console.warn('RECAPTCHA_SECRET_KEY no configurado — omitiendo verificación')
      return true
    }

    const res  = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    `secret=${secret}&response=${token}`,
    })
    const data = await res.json()

    if (!data.success || data.score < THRESHOLD) {
      throw new ForbiddenError('Verificación de seguridad fallida. Intenta de nuevo.')
    }
    return true
  },
}
