// ─── ContactController — S + D ────────────────────────────────────────────────
// S: solo orquesta HTTP ↔ ContactService.
// D: depende de ContactService (abstracción), no del canal de notificación directamente.

import { contactSchema }   from './contact.validators.js'
import { ContactService }  from './contact.service.js'

export async function sendMessage(req, res, next) {
  try {
    const data   = contactSchema.parse(req.body)
    const result = await ContactService.processMessage(data)
    res.status(201).json(result)
  } catch (err) { next(err) }
}
