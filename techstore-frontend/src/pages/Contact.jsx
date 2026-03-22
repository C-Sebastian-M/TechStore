import { useState } from 'react'
import * as contactService from '../services/contactService.js'

const CONTACT_INFO = [
  { icon: 'location_on', title: 'Dirección',  lines: ['Calle 72 # 10-07, Piso 3', 'Medellín, Antioquia, Colombia'] },
  { icon: 'schedule',    title: 'Horario',    lines: ['Lun – Vie: 8:00am – 6:00pm', 'Sáb: 9:00am – 2:00pm'] },
  { icon: 'phone',       title: 'Teléfono',   lines: ['+57 (4) 123-4567', 'WhatsApp: +57 310 123 4567'] },
  { icon: 'email',       title: 'Correo',     lines: ['soporte@techstore.com', 'ventas@techstore.com'] },
]

const TOPICS = [
  'Consulta sobre producto',
  'Estado de mi pedido',
  'Problema técnico',
  'Devolución o garantía',
  'Asesoría para armar PC',
  'Otro',
]

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', topic: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')
    try {
      await contactService.sendContactMessage(formData)
      setSent(true)
    } catch (err) {
      setSubmitError(err.message || 'Error al enviar el mensaje. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors outline-none text-sm'

  return (
    <div className="flex-grow">

      {/* Hero */}
      <section className="relative py-16 px-4 text-center overflow-hidden border-b border-border-dark">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-5">
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            Estamos aquí para ayudarte
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Contáctanos
          </h1>
          <p className="text-slate-400 text-lg">
            ¿Tienes preguntas sobre un producto, tu pedido o necesitas asesoría? Escríbenos y te respondemos en menos de 24 horas.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Info Cards */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {CONTACT_INFO.map((info) => (
            <div key={info.title} className="flex gap-4 p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/40 transition-all group">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-[20px]">{info.icon}</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-1">{info.title}</p>
                {info.lines.map((line) => (
                  <p key={line} className="text-slate-400 text-sm">{line}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-bold">En línea ahora</span>
            </div>
            <h4 className="text-white font-bold mb-1">Chat en vivo</h4>
            <p className="text-slate-400 text-sm mb-3">Nuestro equipo responde en minutos durante horario hábil.</p>
            <button className="w-full h-9 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Iniciar Chat
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border-dark">
              <h2 className="text-xl font-bold text-white">Envíanos un mensaje</h2>
              <p className="text-slate-400 text-sm mt-1">Te responderemos en un plazo máximo de 24 horas hábiles.</p>
            </div>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                <div className="size-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-400 text-[36px]">mark_email_read</span>
                </div>
                <h3 className="text-xl font-bold text-white">¡Mensaje enviado!</h3>
                <p className="text-slate-400 max-w-sm">
                  Gracias por contactarnos. Recibirás una respuesta en <strong className="text-white">menos de 24 horas</strong> en el correo que proporcionaste.
                </p>
                <button
                  onClick={() => { setSent(false); setFormData({ name: '', email: '', topic: '', message: '' }) }}
                  className="mt-2 text-primary hover:underline text-sm font-medium"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-name" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nombre *</label>
                    <input
                      id="contact-name"
                      className={inputClass}
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Correo *</label>
                    <input
                      id="contact-email"
                      className={inputClass}
                      type="email"
                      placeholder="tu@correo.com"
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-topic" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Asunto *</label>
                  <div className="relative">
                    <select
                      id="contact-topic"
                      className={`${inputClass} appearance-none cursor-pointer`}
                      value={formData.topic}
                      onChange={handleChange('topic')}
                      required
                    >
                      <option value="">Selecciona un tema...</option>
                      {TOPICS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-message" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mensaje *</label>
                  <textarea
                    id="contact-message"
                    className="w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 transition-colors outline-none text-sm resize-none"
                    rows={5}
                    placeholder="Describe tu consulta con el mayor detalle posible..."
                    value={formData.message}
                    onChange={handleChange('message')}
                    required
                  />
                  <span className="text-xs text-slate-500 text-right">{formData.message.length}/500</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-attachment" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Adjunto (opcional)</label>
                  <label className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-border-dark hover:border-primary/50 cursor-pointer transition-colors group" htmlFor="contact-attachment">
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">attach_file</span>
                    <span className="text-slate-500 text-sm group-hover:text-slate-300 transition-colors">
                      Haz clic para adjuntar una imagen o captura de pantalla
                    </span>
                    <input id="contact-attachment" type="file" className="hidden" accept="image/*,.pdf" />
                  </label>
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
