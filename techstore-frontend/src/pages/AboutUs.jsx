import { Link } from 'react-router-dom'

const STATS = [
  { value: '12K+', label: 'Clientes satisfechos', icon: 'people' },
  { value: '8,000+', label: 'Productos en catálogo', icon: 'inventory_2' },
  { value: '99.2%', label: 'Tasa de satisfacción', icon: 'star' },
  { value: '48h', label: 'Envío promedio', icon: 'local_shipping' },
]

const TEAM = [
  { name: 'Carlos Méndez', role: 'CEO & Fundador', icon: 'person', color: 'from-primary to-cyan-400' },
  { name: 'Laura Sánchez', role: 'Directora de Producto', icon: 'person', color: 'from-purple-500 to-pink-500' },
  { name: 'Diego Torres', role: 'Jefe de Tecnología', icon: 'person', color: 'from-green-400 to-teal-500' },
  { name: 'Ana Ruiz', role: 'Customer Success', icon: 'person', color: 'from-orange-400 to-red-500' },
]

const VALUES = [
  { icon: 'verified', title: 'Autenticidad garantizada', desc: 'Todos nuestros productos son 100% originales con garantía oficial del fabricante.' },
  { icon: 'support_agent', title: 'Soporte experto', desc: 'Nuestro equipo de técnicos te asesora para armar la mejor PC según tu presupuesto.' },
  { icon: 'local_shipping', title: 'Envío rápido y seguro', desc: 'Empaque especializado para componentes delicados. Seguro incluido en todos los pedidos.' },
  { icon: 'price_check', title: 'Mejor precio garantizado', desc: 'Si encuentras el mismo producto más barato, lo igualamos sin preguntas.' },
]

const MILESTONES = [
  { year: '2018', title: 'Fundación', desc: 'TechStore nace en un pequeño local con una gran pasión por el hardware.' },
  { year: '2020', title: 'Expansión online', desc: 'Lanzamos nuestra tienda online y llegamos a toda Latinoamérica.' },
  { year: '2022', title: 'Configurador PC', desc: 'Presentamos nuestro configurador inteligente con verificación de compatibilidad.' },
  { year: '2024', title: '+12,000 clientes', desc: 'Superamos los 12,000 clientes y abrimos nuestro segundo almacén.' },
]

export default function AboutUs() {
  return (
    <div className="flex-grow">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <span className="material-symbols-outlined text-[16px]">memory</span>
            Nuestra Historia
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Apasionados por el{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              hardware
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Desde 2018 ayudamos a gamers, creadores y profesionales a encontrar los mejores componentes para construir sus sueños. No vendemos cajas, construimos experiencias.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/productos"
              className="flex items-center gap-2 h-12 bg-primary hover:bg-blue-600 text-white font-bold px-8 rounded-lg transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              Ver Productos
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to="/contacto"
              className="flex items-center gap-2 h-12 border border-border-dark bg-surface-dark hover:border-primary text-white font-bold px-8 rounded-lg transition-all hover:-translate-y-0.5"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border-dark bg-surface-dark/40 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-3 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Misión / Visión ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/30 p-8">
            <div className="absolute -top-6 -right-6 size-32 bg-primary/10 rounded-full blur-2xl" />
            <span className="material-symbols-outlined text-primary text-[36px] mb-4 block">flag</span>
            <h3 className="text-2xl font-bold text-white mb-3">Nuestra Misión</h3>
            <p className="text-slate-400 leading-relaxed">
              Democratizar el acceso a tecnología de alto rendimiento, ofreciendo asesoría experta y productos auténticos a precios justos para que cualquier persona pueda construir su PC ideal.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8">
            <div className="absolute -top-6 -right-6 size-32 bg-purple-500/10 rounded-full blur-2xl" />
            <span className="material-symbols-outlined text-purple-400 text-[36px] mb-4 block">visibility</span>
            <h3 className="text-2xl font-bold text-white mb-3">Nuestra Visión</h3>
            <p className="text-slate-400 leading-relaxed">
              Ser el referente #1 en Latinoamérica para la compra de componentes de PC, reconocidos por nuestra honestidad, conocimiento técnico y compromiso con la comunidad gamer y maker.
            </p>
          </div>
        </div>
      </section>

      {/* ── Valores ── */}
      <section className="py-16 px-4 bg-surface-dark/30 border-y border-border-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Lo que nos define</h2>
            <p className="text-slate-400">Los valores que guían cada decisión que tomamos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4 p-6 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/40 transition-all group">
                <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined">{v.icon}</span>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{v.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Nuestra historia</h2>
            <p className="text-slate-400">De local a referente regional</p>
          </div>
          <div className="flex flex-col gap-0">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                {/* Year + line */}
                <div className="flex flex-col items-center">
                  <div className="size-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-black">{m.year}</span>
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div className="w-0.5 h-12 bg-border-dark mt-1 mb-1" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-10 pt-2">
                  <h4 className="text-white font-bold text-lg mb-1">{m.title}</h4>
                  <p className="text-slate-400 text-sm">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-16 px-4 bg-surface-dark/30 border-y border-border-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">El equipo detrás</h2>
            <p className="text-slate-400">Personas apasionadas con una misión clara</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/40 transition-all group">
                <div className={`size-16 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-[32px]">{member.icon}</span>
                </div>
                <div>
                  <p className="text-white font-bold">{member.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">¿Listo para armar tu PC?</h2>
          <p className="text-slate-400 mb-8">Nuestro equipo está disponible para ayudarte a elegir los mejores componentes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/productos" className="flex items-center gap-2 h-12 bg-primary hover:bg-blue-600 text-white font-bold px-8 rounded-lg transition-all shadow-lg shadow-primary/20">
              Explorar Productos
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link to="/contacto" className="flex items-center gap-2 h-12 border border-border-dark bg-surface-dark hover:border-primary text-white font-bold px-8 rounded-lg transition-all">
              Hablar con un experto
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
