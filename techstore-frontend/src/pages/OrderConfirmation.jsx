import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import * as orderService from '../services/orderService.js'

const STEPS = [
  { icon: 'inventory_2',    label: 'Pedido recibido',   done: true              },
  { icon: 'payments',       label: 'Pago confirmado',   done: true              },
  { icon: 'inventory',      label: 'Preparando envío',  done: false, active: true },
  { icon: 'local_shipping', label: 'En camino',         done: false             },
  { icon: 'check_circle',   label: 'Entregado',         done: false             },
]

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  // Bug 8 — Si el usuario recarga, cargar el pedido desde la API por orderNumber
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (location.state?.fromPayment) {
      // Llegó directamente desde el pago — usar datos del state
      setOrderData(location.state)
    } else {
      // El usuario recargó o llegó directamente → redirigir al inicio
      // (no tenemos orderNumber en la URL, así que no podemos recuperarlo)
      navigate('/', { replace: true })
    }
  }, [])

  if (!orderData || loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
      </div>
    )
  }

  const {
    order        = {},
    orderItems   = [],
    shippingData = {},
    subtotal     = 0,
    tax          = 0,
    shipping     = 0,
    total        = 0,
  } = orderData

  // Usar el orderNumber real del pedido si está disponible
  const orderId = order?.orderNumber || ('TS-' + Date.now().toString(36).toUpperCase())

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 2)
  const deliveryStr = deliveryDate.toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'long'
  })

  return (
    <div className="flex-grow">
      {/* Hero de éxito */}
      <div className="relative bg-gradient-to-b from-green-500/10 to-transparent border-b border-border-dark py-16 px-4 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative inline-flex size-24 items-center justify-center rounded-full bg-green-500/20 border-2 border-green-500/40 mb-6 mx-auto">
          <span className="material-symbols-outlined text-green-400 text-[52px]">check_circle</span>
          <div className="absolute inset-0 rounded-full border-2 border-green-400/40 animate-ping" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-slate-400 text-lg mb-6">
          Gracias por tu compra. Recibirás un correo de confirmación pronto.
        </p>

        <div className="inline-flex items-center gap-3 bg-surface-dark border border-border-dark rounded-xl px-5 py-3">
          <div className="flex flex-col items-start">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Número de pedido</span>
            <span className="text-white font-bold font-mono text-lg">{orderId}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm text-primary hover:text-blue-400 transition-colors border-l border-border-dark pl-3 ml-1"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Tracking Steps */}
          <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Estado del Pedido
            </h2>
            <div className="flex flex-col gap-0">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`size-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      step.done
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : step.active
                        ? 'bg-primary/20 border-primary text-primary animate-pulse'
                        : 'bg-surface-dark border-border-dark text-slate-600'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">{step.done ? 'check' : step.icon}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 mb-1 rounded-full ${step.done ? 'bg-green-500/40' : 'bg-border-dark'}`} />
                    )}
                  </div>
                  <div className="pb-6 flex flex-col justify-center">
                    <span className={`text-sm font-bold ${step.done ? 'text-green-400' : step.active ? 'text-white' : 'text-slate-600'}`}>
                      {step.label}
                    </span>
                    {step.active && (
                      <span className="text-xs text-slate-500 mt-0.5">Tiempo estimado: 1–2 días hábiles</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Detalles de Envío */}
          <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">home</span>
              Dirección de Envío
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed">
              <p className="text-white font-medium">{shippingData.name}</p>
              <p>{shippingData.address}</p>
              <p>{shippingData.city}{shippingData.postalCode ? `, CP ${shippingData.postalCode}` : ''}</p>
              <p>{shippingData.country}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 bg-background-dark rounded-lg px-4 py-3">
              <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
              Entrega estimada: <span className="text-white font-medium ml-1">{deliveryStr}</span>
            </div>
          </section>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 h-11 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Seguir comprando
            </Link>
            <Link
              to="/pedidos"
              className="flex-1 flex items-center justify-center gap-2 h-11 border border-border-dark bg-surface-dark hover:border-primary text-white font-bold rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              Ver mis pedidos
            </Link>
          </div>
        </div>

        {/* Right: Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden sticky top-24">
            <div className="p-5 border-b border-border-dark">
              <h3 className="text-lg font-bold text-white">Resumen</h3>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-64 overflow-y-auto">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="size-12 rounded-lg bg-background-dark border border-border-dark shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                      : <span className="material-symbols-outlined text-slate-600 text-[24px]">developer_board</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-2 leading-snug">{item.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">x{item.qty}</p>
                  </div>
                  <span className="text-white text-sm font-bold shrink-0">
                    ${(Number(item.price) * item.qty).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-border-dark bg-background-dark/30 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">${Number(subtotal).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Envío</span>
                <span className="text-white">{Number(shipping) === 0 ? 'Gratis' : `$${Number(shipping).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IVA (19%)</span>
                <span className="text-white">${Number(tax).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border-dark font-bold text-base">
                <span className="text-white">Total</span>
                <span className="text-primary">${Number(total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
