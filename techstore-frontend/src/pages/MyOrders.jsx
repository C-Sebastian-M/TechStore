import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNavigate, Link } from 'react-router-dom'
import { useApi, Spinner, ErrorState } from '../hooks/useApi.jsx'
import * as orderService from '../services/orderService.js'
import { FORMAT_CURRENCY } from '../constants'

// ─── MAPEO de estados del backend → etiquetas y colores ──────────────────────
const STATUS_CONFIG = {
  RECEIVED:          { label: 'Pedido recibido',   color: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/20',  icon: 'receipt_long'    },
  PAYMENT_CONFIRMED: { label: 'Pago confirmado',   color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: 'payments'        },
  PREPARING:         { label: 'Preparando envío',  color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  icon: 'inventory'       },
  SHIPPED:           { label: 'En camino',         color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   icon: 'local_shipping'  },
  DELIVERED:         { label: 'Entregado',         color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  icon: 'check_circle'    },
  CANCELLED:         { label: 'Cancelado',         color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    icon: 'cancel'          },
}

const TRACKER_STEPS = [
  { key: 'RECEIVED',          label: 'Recibido',       icon: 'receipt_long'   },
  { key: 'PAYMENT_CONFIRMED', label: 'Pago confirmado',icon: 'payments'       },
  { key: 'PREPARING',         label: 'Preparando',     icon: 'inventory'      },
  { key: 'SHIPPED',           label: 'En camino',      icon: 'local_shipping' },
  { key: 'DELIVERED',         label: 'Entregado',      icon: 'check_circle'   },
]

const STATUS_ORDER = ['RECEIVED', 'PAYMENT_CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']

// ─── TARJETA DE PEDIDO ────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const { addToCart }  = useCart()
  const navigate       = useNavigate()
  const cfg            = STATUS_CONFIG[order.status] || STATUS_CONFIG.RECEIVED
  const statusIdx      = STATUS_ORDER.indexOf(order.status)

  const handleReorder = () => {
    order.items.forEach(item => {
      // Bug 10 — addToCart espera un objeto de producto completo.
      // Se agregan de uno en uno usando qty para respetar el límite
      // de CART_MAX_QTY por producto. El id debe ser el CUID real del
      // producto (item.productId viene del backend como CUID).
      const qty = item.qty ?? 1
      for (let i = 0; i < qty; i++) {
        addToCart({
          id:    item.productId,       // CUID real del backend
          name:  item.product.name,
          brand: item.product.brand,
          image: item.product.image,
          price: Number(item.unitPrice),
        })
      }
    })
    navigate('/carrito')
  }

  const date = new Date(order.createdAt).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden">

      {/* ── CABECERA ── */}
      <div className="p-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-black text-base font-mono">{order.orderNumber}</span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
              <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
              {cfg.label}
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            {date} · {order.items.length} producto{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod === 'card' ? 'Tarjeta' : 'PayPal'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-primary font-black text-lg">${FORMAT_CURRENCY(Number(order.total))}</p>
          <p className="text-slate-600 text-xs">Total con IVA</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Reordenar solo disponible cuando el pedido aún puede modificarse */}
          {(order.status === 'PAYMENT_CONFIRMED' || order.status === 'PREPARING') && (
            <button
              onClick={handleReorder}
              className="flex items-center gap-1.5 h-8 px-3 bg-primary/10 border border-primary/30 rounded-lg text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">replay</span>
              Reordenar
            </button>
          )}
          {/* Pedido ya en tránsito o entregado: no se puede reordenar */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <div className="relative" style={{ zIndex: 20 }}>
              <div
                className="group flex flex-col items-center gap-1"
                title={order.status === 'SHIPPED'
                  ? 'El pedido ya está en camino. Crea un pedido nuevo desde el catálogo.'
                  : 'El pedido ya fue entregado. Crea un pedido nuevo desde el catálogo.'
                }
              >
                <button
                  disabled
                  className="flex items-center gap-1.5 h-8 px-3 border border-border-dark rounded-lg text-slate-600 text-xs font-bold cursor-not-allowed select-none"
                >
                  <span className="material-symbols-outlined text-[15px]">replay</span>
                  Reordenar
                </button>
                <span className="text-[10px] text-slate-600 leading-none">
                  {order.status === 'SHIPPED' ? 'En camino' : 'Entregado'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 h-8 px-3 border border-border-dark rounded-lg text-slate-400 text-xs font-bold hover:border-primary/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">{expanded ? 'expand_less' : 'expand_more'}</span>
            {expanded ? 'Ocultar' : 'Detalle'}
          </button>
        </div>
      </div>

      {/* Miniaturas */}
      <div className="px-5 pb-4 flex gap-3 overflow-x-auto">
        {order.items.map(item => (
          <div key={item.id} className="size-14 rounded-xl bg-background-dark border border-border-dark shrink-0 flex items-center justify-center overflow-hidden">
            {item.product.image
              ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1" />
              : <span className="material-symbols-outlined text-slate-600">developer_board</span>
            }
          </div>
        ))}
      </div>

      {/* ── DETALLE EXPANDIBLE ── */}
      {expanded && (
        <div className="border-t border-border-dark">

          {/* Tracker */}
          {order.status !== 'CANCELLED' && (
            <div className="px-5 py-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Estado del pedido</p>
              <div className="flex items-center">
                {TRACKER_STEPS.map((step, i) => {
                  const done   = i <= statusIdx
                  const active = i === statusIdx
                  const isLast = i === TRACKER_STEPS.length - 1
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`size-8 rounded-full flex items-center justify-center border-2 ${
                          active ? 'bg-primary border-primary text-white animate-pulse' :
                          done   ? 'bg-green-500/20 border-green-500 text-green-400' :
                                   'bg-background-dark border-border-dark text-slate-600'
                        }`}>
                          <span className="material-symbols-outlined text-[15px]">
                            {done && !active ? 'check' : step.icon}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold text-center leading-tight max-w-[60px] ${
                          active ? 'text-primary' : done ? 'text-green-400' : 'text-slate-600'
                        }`}>{step.label}</span>
                      </div>
                      {!isLast && (
                        <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full ${i < statusIdx ? 'bg-green-500/40' : 'bg-border-dark'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Productos */}
          <div className="px-5 pb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Productos</p>
            <div className="flex flex-col gap-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-background-dark rounded-xl p-3 border border-border-dark">
                  <div className="size-12 rounded-lg bg-surface-dark border border-border-dark shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product.image
                      ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1" />
                      : <span className="material-symbols-outlined text-slate-600">developer_board</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{item.product.name}</p>
                    <p className="text-slate-500 text-xs">{item.product.brand} · Cant: {item.qty}</p>
                  </div>
                  <span className="text-primary font-black text-sm shrink-0">
                    ${FORMAT_CURRENCY(Number(item.unitPrice) * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de costos */}
          <div className="mx-5 mb-5 bg-background-dark rounded-xl border border-border-dark p-4">
            <div className="flex flex-col gap-1.5 text-sm">
              {[
                { label: 'Subtotal',                    value: `$${FORMAT_CURRENCY(Number(order.subtotal))}` },
                ...(Number(order.discount) > 0 ? [{ label: `Descuento (${order.promoCode})`, value: `-$${FORMAT_CURRENCY(Number(order.discount))}` }] : []),
                { label: 'IVA (19%)',                   value: `$${FORMAT_CURRENCY(Number(order.tax))}` },
                { label: 'Envío',                       value: Number(order.shipping) === 0 ? 'Gratis' : `$${FORMAT_CURRENCY(Number(order.shipping))}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-white">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border-dark pt-2 mt-1">
                <span className="text-white font-black">Total</span>
                <span className="text-primary font-black">${FORMAT_CURRENCY(Number(order.total))}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-dark flex items-center gap-2 text-xs text-slate-500">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {order.shippingAddress}, {order.shippingCity}, {order.shippingCountry}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function MyOrders() {
  const { user, openLogin } = useAuth()
  const [filterStatus, setFilterStatus] = useState('TODOS')

  // Cargar pedidos reales de la API
  const { data: orders, loading, error, execute: refetch } = useApi(
    () => orderService.getMyOrders(),
    [user?.id],
    { immediate: !!user }
  )

  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-background-dark px-4 py-20 text-center">
        <span className="material-symbols-outlined text-[56px] text-slate-700 mb-4">lock</span>
        <h2 className="text-white font-black text-2xl mb-2">Acceso restringido</h2>
        <p className="text-slate-500 mb-6">Debes iniciar sesión para ver tus pedidos.</p>
        <button
          onClick={openLogin}
          className="h-10 px-6 bg-primary rounded-lg text-white font-bold text-sm hover:bg-blue-600 transition-colors"
        >
          Iniciar sesión
        </button>
      </div>
    )
  }

  const FILTERS = [
    { key: 'TODOS',             label: 'Todos'         },
    { key: 'PREPARING',         label: 'Preparando'    },
    { key: 'SHIPPED',           label: 'En camino'     },
    { key: 'DELIVERED',         label: 'Entregados'    },
    { key: 'CANCELLED',         label: 'Cancelados'    },
  ]

  // El backend ahora devuelve { data: [...], pagination: {...} } — extraer array
  const allOrders = Array.isArray(orders) ? orders : (orders?.data || [])
  const filtered  = filterStatus === 'TODOS'
    ? allOrders
    : allOrders.filter(o => o.status === filterStatus)

  return (
    <div className="flex-grow bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Cabecera */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              Mis Pedidos
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {loading ? 'Cargando...' : `${allOrders.length} pedido${allOrders.length !== 1 ? 's' : ''} realizados`}
            </p>
          </div>
          <Link
            to="/perfil"
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border-dark bg-surface-dark text-slate-300 text-sm font-bold hover:border-primary/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Mi Perfil
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => {
            const count = f.key === 'TODOS' ? allOrders.length : allOrders.filter(o => o.status === f.key).length
            return (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  filterStatus === f.key
                    ? 'bg-primary text-white'
                    : 'bg-surface-dark border border-border-dark text-slate-400 hover:text-white hover:border-primary/40'
                }`}
              >
                {f.key !== 'TODOS' && STATUS_CONFIG[f.key] && (
                  <span className="material-symbols-outlined text-[14px]">{STATUS_CONFIG[f.key].icon}</span>
                )}
                {f.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === f.key ? 'bg-white/20' : 'bg-background-dark'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filtered.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-700 mb-3">inventory_2</span>
            <p className="text-white font-bold">
              {filterStatus === 'TODOS' ? 'Aún no tienes pedidos' : 'Sin pedidos en este estado'}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {filterStatus === 'TODOS' ? 'Realiza tu primera compra.' : 'Prueba otro filtro.'}
            </p>
            <Link
              to="/productos"
              className="mt-4 h-10 px-6 bg-primary rounded-lg text-white font-bold text-sm hover:bg-blue-600 transition-colors inline-flex items-center"
            >
              Ver catálogo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
