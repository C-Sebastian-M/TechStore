import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEF'

function GlitchText({ text }) {
  const [displayed, setDisplayed] = useState(text)

  useEffect(() => {
    let iterations = 0
    const interval = setInterval(() => {
      setDisplayed(
        text
          .split('')
          .map((char, i) => {
            if (i < iterations) return text[i]
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          })
          .join('')
      )
      if (iterations >= text.length) clearInterval(interval)
      iterations += 0.5
    }, 40)
    return () => clearInterval(interval)
  }, [text])

  return <span>{displayed}</span>
}

const QUICK_LINKS = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/productos', label: 'Componentes', icon: 'memory' },
  { to: '/carrito', label: 'Mi Carrito', icon: 'shopping_cart' },
  { to: '/contacto', label: 'Soporte', icon: 'support_agent' },
]

export default function NotFound() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid decoration */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#137fec 1px, transparent 1px), linear-gradient(90deg, #137fec 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">

        {/* 404 número grande */}
        <div className="relative mb-6">
          <div className="text-[10rem] sm:text-[14rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-slate-600 to-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[10rem] sm:text-[14rem] font-black leading-none text-primary/10 blur-sm select-none">
              404
            </div>
          </div>
          {/* Icono encima */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <span className="material-symbols-outlined text-primary text-[48px]">search_off</span>
            </div>
          </div>
        </div>

        {/* Texto glitch */}
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3 font-mono">
          <GlitchText text="PÁGINA NO ENCONTRADA" />
        </h1>

        <p className="text-slate-400 text-base sm:text-lg mb-2 leading-relaxed">
          La página que buscas no existe, fue movida o nunca existió.
        </p>
        <p className="text-slate-500 text-sm mb-10">
          Redirigiendo al inicio en{' '}
          <span className="text-primary font-bold tabular-nums">{countdown}</span>s
          {' '}—{' '}
          <button onClick={() => navigate('/')} className="text-primary hover:underline">
            ir ahora
          </button>
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[24px]">
                {link.icon}
              </span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Botón principal */}
        <Link
          to="/"
          className="flex items-center gap-2 h-12 bg-primary hover:bg-blue-600 text-white font-bold px-8 rounded-lg transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}
