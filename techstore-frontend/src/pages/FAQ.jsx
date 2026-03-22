import { useState } from 'react'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  { id: 'all', label: 'Todas', icon: 'apps' },
  { id: 'orders', label: 'Pedidos', icon: 'inventory_2' },
  { id: 'shipping', label: 'Envíos', icon: 'local_shipping' },
  { id: 'products', label: 'Productos', icon: 'memory' },
  { id: 'returns', label: 'Devoluciones', icon: 'replay' },
  { id: 'payments', label: 'Pagos', icon: 'payments' },
]

const FAQS = [
  {
    id: 1, category: 'orders',
    q: '¿Cómo puedo rastrear mi pedido?',
    a: 'Una vez confirmado tu pedido, recibirás un correo con el número de seguimiento. También puedes verificar el estado en "Mis Pedidos" dentro de tu cuenta. Trabajamos con transportistas que permiten rastreo en tiempo real.',
  },
  {
    id: 2, category: 'orders',
    q: '¿Puedo modificar o cancelar mi pedido?',
    a: 'Puedes cancelar o modificar tu pedido dentro de las primeras 2 horas de haberlo realizado, siempre que no haya sido enviado aún. Escríbenos por chat o al correo con tu número de orden y te ayudamos de inmediato.',
  },
  {
    id: 3, category: 'shipping',
    q: '¿Cuánto tarda el envío?',
    a: 'El envío estándar tarda entre 3–7 días hábiles. El envío express tarda 1–2 días hábiles. Los tiempos pueden variar según tu ubicación y disponibilidad del producto. Toda nuestra mercancía está asegurada durante el transporte.',
  },
  {
    id: 4, category: 'shipping',
    q: '¿Hacen envíos internacionales?',
    a: 'Por el momento hacemos envíos a México, Colombia, Chile, Perú y Argentina. Estamos trabajando para ampliar la cobertura a más países de Latinoamérica próximamente.',
  },
  {
    id: 5, category: 'shipping',
    q: '¿Los envíos incluyen seguro?',
    a: 'Sí, todos los envíos incluyen seguro de transporte sin costo adicional. En caso de daño o extravío durante el envío, nos hacemos responsables al 100% reemplazando el producto o realizando el reembolso completo.',
  },
  {
    id: 6, category: 'products',
    q: '¿Todos los productos son originales?',
    a: 'Absolutamente. Trabajamos directamente con distribuidores autorizados y marcas reconocidas. Todos los productos incluyen garantía oficial del fabricante. Nunca vendemos productos genéricos o de segunda mano.',
  },
  {
    id: 7, category: 'products',
    q: '¿Cómo funciona el verificador de compatibilidad?',
    a: 'Nuestro configurador de PC verifica automáticamente la compatibilidad entre componentes (socket CPU-Motherboard, tipo de RAM, tamaño de gabinete, etc.). Si seleccionas piezas incompatibles, el sistema te alertará y sugerirá alternativas.',
  },
  {
    id: 8, category: 'products',
    q: '¿Tienen stock de todos los productos listados?',
    a: 'La mayoría de productos están en stock inmediato. Los que muestran "Disponible" se despachan en 24–48 horas. Si un producto está agotado, lo indicamos claramente y puedes activar alertas de reposición.',
  },
  {
    id: 9, category: 'returns',
    q: '¿Cuál es la política de devoluciones?',
    a: 'Aceptamos devoluciones dentro de los primeros 30 días desde la recepción del producto. El artículo debe estar en su empaque original y sin uso. El costo del envío de devolución es cubierto por TechStore si el producto tiene defecto de fábrica.',
  },
  {
    id: 10, category: 'returns',
    q: '¿Qué cubre la garantía?',
    a: 'La garantía cubre defectos de fábrica y fallas que no sean causadas por mal uso, daño físico o eléctrico. El período de garantía varía por producto y fabricante (generalmente 1–3 años). Gestionamos el proceso con el fabricante por ti.',
  },
  {
    id: 11, category: 'payments',
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), PayPal, transferencia bancaria y pago en efectivo mediante OXXO (solo México). Todos los pagos están procesados con encriptación SSL 256-bit.',
  },
  {
    id: 12, category: 'payments',
    q: '¿Ofrecen meses sin intereses?',
    a: 'Sí, ofrecemos hasta 12 meses sin intereses con tarjetas participantes en compras mayores a $500. Las promociones disponibles se muestran automáticamente al momento de pagar según tu tarjeta bancaria.',
  },
]

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${open ? 'border-primary/50 bg-primary/5' : 'border-border-dark bg-surface-dark hover:border-border-dark/80'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className={`font-bold text-sm sm:text-base transition-colors ${open ? 'text-primary' : 'text-white'}`}>
          {faq.q}
        </span>
        <span className={`material-symbols-outlined text-[20px] shrink-0 transition-all duration-300 ${open ? 'rotate-180 text-primary' : 'text-slate-400'}`}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="h-px bg-border-dark mb-4" />
          <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  )
}

const SUPPORT_OPTIONS = [
  { icon: 'chat', title: 'Chat en vivo', desc: 'Respuesta en minutos', cta: 'Iniciar chat', color: 'text-green-400 bg-green-400/10' },
  { icon: 'email', title: 'Correo electrónico', desc: 'Respuesta en < 24h', cta: 'Escribirnos', color: 'text-primary bg-primary/10', to: '/contacto' },
  { icon: 'phone', title: 'Llamada telefónica', desc: 'Lun–Vie 9am–7pm', cta: '+52 55 1234-5678', color: 'text-purple-400 bg-purple-400/10' },
  { icon: 'help', title: 'Centro de ayuda', desc: 'Documentación técnica', cta: 'Ver guías', color: 'text-orange-400 bg-orange-400/10' },
]

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = FAQS.filter((faq) => {
    const matchCat = activeCategory === 'all' || faq.category === activeCategory
    const matchSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="flex-grow">

      {/* Hero */}
      <section className="relative py-16 px-4 text-center border-b border-border-dark overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Encuentra respuestas a las preguntas más frecuentes o contáctanos directamente.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-surface-dark border border-border-dark text-slate-400 hover:text-white hover:border-primary/50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((faq) => <FaqItem key={faq.id} faq={faq} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-slate-600 mb-4 block">search_off</span>
            <p className="text-white font-bold text-lg mb-2">No encontramos resultados</p>
            <p className="text-slate-400 text-sm mb-4">Intenta con otras palabras o{' '}
              <Link to="/contacto" className="text-primary hover:underline">contáctanos directamente</Link>
            </p>
            <button onClick={() => { setSearch(''); setActiveCategory('all') }} className="text-primary hover:underline text-sm">
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-12">
          <div className="flex-1 h-px bg-border-dark" />
          <span className="text-slate-500 text-sm whitespace-nowrap">¿No encontraste lo que buscabas?</span>
          <div className="flex-1 h-px bg-border-dark" />
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUPPORT_OPTIONS.map((opt) => (
            <div key={opt.title} className="flex gap-4 p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/40 transition-all group">
              <div className={`size-11 rounded-lg flex items-center justify-center shrink-0 ${opt.color}`}>
                <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{opt.title}</p>
                <p className="text-slate-500 text-xs mb-2">{opt.desc}</p>
                {opt.to ? (
                  <Link to={opt.to} className="text-primary text-xs font-medium hover:underline">
                    {opt.cta} →
                  </Link>
                ) : (
                  <button className="text-primary text-xs font-medium hover:underline">
                    {opt.cta} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
