import { useState, useEffect, useCallback } from 'react'
import * as adminService from '../../services/adminService.js'
import { FORMAT_CURRENCY } from '../../constants'

const STATUS_OPTIONS = [
  { value: '',                  label: 'Todos'            },
  { value: 'RECEIVED',          label: 'Recibido'         },
  { value: 'PAYMENT_CONFIRMED', label: 'Pago confirmado'  },
  { value: 'PREPARING',         label: 'Preparando'       },
  { value: 'SHIPPED',           label: 'En camino'        },
  { value: 'DELIVERED',         label: 'Entregado'        },
  { value: 'CANCELLED',         label: 'Cancelado'        },
]

const STATUS_COLOR = {
  RECEIVED: 'text-slate-400 bg-slate-400/10',
  PAYMENT_CONFIRMED: 'text-purple-400 bg-purple-400/10',
  PREPARING: 'text-amber-400 bg-amber-400/10',
  SHIPPED: 'text-blue-400 bg-blue-400/10',
  DELIVERED: 'text-green-400 bg-green-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
}

// Modal de detalle / cambio de estado
function OrderDetailModal({ orderId, onClose, onUpdated }) {
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    adminService.getAdminOrder(orderId)
      .then(o => { setOrder(o); setStatus(o.status) })
      .catch(() => setError('No se pudo cargar el pedido.'))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleSaveStatus = async () => {
    if (status === order.status) return
    setSaving(true); setError('')
    try {
      await adminService.updateOrderStatus(orderId, status)
      onUpdated()
      onClose()
    } catch (err) { setError(err.message || 'Error al actualizar.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark shrink-0">
          <h2 className="text-white font-black text-lg">Detalle del pedido</h2>
          <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
            </div>
          ) : !order ? (
            <p className="text-red-400 text-center py-8">{error}</p>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Info general */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-dark rounded-xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Número</p>
                  <p className="text-white font-black font-mono">{order.orderNumber}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Fecha</p>
                  <p className="text-white font-bold text-sm">{new Date(order.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-white font-bold text-sm">{order.user?.name}</p>
                  <p className="text-slate-500 text-xs">{order.user?.email}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total</p>
                  <p className="text-primary font-black text-lg">${FORMAT_CURRENCY(Number(order.total))}</p>
                </div>
              </div>

              {/* Cambiar estado */}
              <div className="bg-background-dark rounded-xl p-4 flex flex-col gap-3">
                <p className="text-white font-bold text-sm">Cambiar estado del pedido</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.filter(s => s.value).map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        status === s.value
                          ? 'bg-primary border-primary text-white'
                          : 'border-border-dark text-slate-400 hover:border-primary/50 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleSaveStatus}
                  disabled={saving || status === order.status}
                  className="self-start h-9 px-5 bg-primary rounded-lg text-white text-sm font-black hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {saving && <span className="animate-spin material-symbols-outlined text-[15px]">progress_activity</span>}
                  Guardar estado
                </button>
              </div>

              {/* Productos */}
              <div>
                <p className="text-white font-bold text-sm mb-3">Productos ({order.items.length})</p>
                <div className="flex flex-col gap-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-background-dark rounded-xl p-3 border border-border-dark">
                      <div className="size-12 rounded-lg bg-surface-dark shrink-0 overflow-hidden flex items-center justify-center">
                        {item.product.image
                          ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1" />
                          : <span className="material-symbols-outlined text-slate-600 text-[18px]">developer_board</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{item.product.name}</p>
                        <p className="text-slate-500 text-xs">{item.product.brand} · x{item.qty}</p>
                      </div>
                      <span className="text-primary font-bold shrink-0">${FORMAT_CURRENCY(Number(item.unitPrice) * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-background-dark rounded-xl p-4 flex flex-col gap-2 text-sm">
                {[
                  { l: 'Subtotal', v: `$${FORMAT_CURRENCY(Number(order.subtotal))}` },
                  { l: 'Descuento', v: `-$${FORMAT_CURRENCY(Number(order.discount))}`, hide: Number(order.discount) === 0 },
                  { l: 'IVA (19%)', v: `$${FORMAT_CURRENCY(Number(order.tax))}` },
                  { l: 'Envío', v: Number(order.shipping) === 0 ? 'Gratis' : `$${FORMAT_CURRENCY(Number(order.shipping))}` },
                ].filter(r => !r.hide).map(r => (
                  <div key={r.l} className="flex justify-between">
                    <span className="text-slate-400">{r.l}</span>
                    <span className="text-white">{r.v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-border-dark font-black">
                  <span className="text-white">Total</span>
                  <span className="text-primary">${FORMAT_CURRENCY(Number(order.total))}</span>
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-background-dark rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Dirección de envío</p>
                <p className="text-white text-sm font-bold">{order.shippingName}</p>
                <p className="text-slate-400 text-sm">{order.shippingAddress}</p>
                <p className="text-slate-400 text-sm">{order.shippingCity}, {order.shippingCountry}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders,     setOrders]     = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [status,     setStatus]     = useState('')
  const [page,       setPage]       = useState(1)
  const [detail,     setDetail]     = useState(null) // orderId
  const [toast,      setToast]      = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getAdminOrders({ page, limit: 15, status: status || undefined, search: search || undefined })
      setOrders(res.data || [])
      setPagination(res.pagination || null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, status, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [status, search])

  return (
    <div className="p-6 flex flex-col gap-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-white">Pedidos</h1>
        <p className="text-slate-500 text-sm mt-0.5">{pagination?.total ?? '—'} pedidos en total</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            className="w-full bg-surface-dark border border-border-dark text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none"
            placeholder="Buscar pedido, cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-surface-dark border border-border-dark text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary outline-none"
        >
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark bg-background-dark/40">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border-dark border-t-primary" /></div>
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-500">Sin pedidos</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-bold font-mono text-sm">{order.orderNumber}</p>
                    <p className="text-slate-500 text-xs">{order.items.length} producto(s)</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{order.user?.name}</p>
                    <p className="text-slate-500 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] || ''}`}>
                      {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-bold">${FORMAT_CURRENCY(Number(order.total))}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDetail(order.id)}
                      className="h-8 px-3 rounded-lg border border-border-dark text-slate-400 text-xs font-bold hover:border-primary hover:text-primary transition-colors"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
            <span className="text-slate-500 text-xs">Página {pagination.page} de {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 rounded-lg border border-border-dark text-slate-400 text-xs font-bold disabled:opacity-40 hover:border-primary hover:text-primary">← Anterior</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="h-8 px-3 rounded-lg border border-border-dark text-slate-400 text-xs font-bold disabled:opacity-40 hover:border-primary hover:text-primary">Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <OrderDetailModal
          orderId={detail}
          onClose={() => setDetail(null)}
          onUpdated={() => { load(); showToast('Estado actualizado.') }}
        />
      )}
    </div>
  )
}
