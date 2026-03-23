import nodemailer from 'nodemailer'

// ─── TRANSPORTER DE GMAIL ─────────────────────────────────────────────────────
// Usa cuenta de Gmail con contraseña de aplicación (no la contraseña normal).
// Cómo obtener la contraseña de aplicación:
//   1. Activa verificación en 2 pasos en tu cuenta Google
//   2. Ve a: myaccount.google.com → Seguridad → Contraseñas de aplicación
//   3. Crea una contraseña para "Correo" → copia los 16 caracteres
//   4. Pon esos 16 caracteres en GMAIL_APP_PASSWORD (sin espacios)
function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

// ─── ENVIAR CÓDIGO DE VERIFICACIÓN ───────────────────────────────────────────
export async function sendVerificationCode(email, name, code) {
  const transporter = createTransporter()

  // Sin credenciales → modo desarrollo, solo loguear el código
  if (!transporter) {
    console.log(`\n📧 [DEV] Código de verificación para ${email}: ${code}\n`)
    return
  }

  const senderName  = 'TechStore'
  const senderEmail = process.env.GMAIL_USER

  await transporter.sendMail({
    from:    `"${senderName}" <${senderEmail}>`,
    to:      email,
    subject: `${code} es tu código de verificación — TechStore`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0a1520;font-family:system-ui,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1520;padding:40px 20px;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#111e2e;border-radius:16px;border:1px solid #1e3a5a;overflow:hidden;">

                <!-- Header -->
                <tr><td style="background:linear-gradient(135deg,#137fec,#06b6d4);padding:32px;text-align:center;">
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                      <span style="color:white;font-size:18px;">⚡</span>
                    </div>
                    <span style="color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px;">TechStore</span>
                  </div>
                </td></tr>

                <!-- Body -->
                <tr><td style="padding:40px 36px;">
                  <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px;">Verificación de correo</h1>
                  <p style="color:#94a3b8;font-size:15px;margin:0 0 32px;">Hola <strong style="color:white;">${name}</strong>, usa este código para confirmar tu correo:</p>

                  <!-- Código -->
                  <div style="background:#0a1520;border:2px solid #137fec;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
                    <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#137fec;font-family:monospace;">${code}</span>
                    <p style="color:#64748b;font-size:13px;margin:12px 0 0;">Válido por <strong style="color:#94a3b8;">10 minutos</strong></p>
                  </div>

                  <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;">
                    Si no solicitaste esta verificación, ignora este correo.<br>
                    Nunca compartiremos tu código con nadie.
                  </p>
                </td></tr>

                <!-- Footer -->
                <tr><td style="padding:20px 36px;border-top:1px solid #1e3a5a;text-align:center;">
                  <p style="color:#334155;font-size:12px;margin:0;">© 2025 TechStore Colombia · Medellín, Colombia</p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  })

  console.log(`📧 Código enviado a ${email}`)
}
