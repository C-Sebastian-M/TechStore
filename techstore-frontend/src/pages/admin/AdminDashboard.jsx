import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as adminService from '../../services/adminService.js'
import { FORMAT_CURRENCY } from '../../constants'

const STATUS_LABEL = {
  RECEIVED:          'Recibido',
  PAYMENT_CONFIRMED: 'Pago confirmado',
  PREPARING:         'Preparando',
  SHIPPED:           'En camino',
  DELIVERED:         'Entregado',
  CANCELLED:         'Cancelado',
}
const STATUS_COLOR = {
  RECEIVED:          'text-slate-400',
  PAYMENT_CONFIRMED: 'text-purple-400',
  PREPARING:         'text-amber-400',
  SHIPPED:           'text-blue-400',
  DELIVERED:         'text-green-400',
  CANCELLED:         'text-red-400',
}
const STATUS_BG = {
  RECEIVED:          'bg-slate-400/10',
  PAYMENT_CONFIRMED: 'bg-purple-400/10',
  PREPARING:         'bg-amber-400/10',
  SHIPPED:           'bg-blue-400/10',
  DELIVERED:         'bg-green-400/10',
  CANCELLED:         'bg-red-400/10',
}

function StatCard({ icon, label, value, sub, color = 'text-primary', trend }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
        {trend !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span className="material-symbols-outlined text-[14px]">{trend >= 0 ? 'trending_up' : 'trending_down'}</span>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-white font-black text-2xl">{value}</p>
        <p className="text-slate-500 text-xs mt-0.5">{label}</p>
        {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    adminService.getDashboard()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="material-symbols-outlined text-[48px] text-red-400">error</span>
      <p className="text-slate-400">Error al cargar el dashboard. Verifica que el servidor esté corriendo.</p>
    </div>
  )

  const { revenue, orders, users, lowStock, recentOrders, topProducts } = data
  const orderStatusEntries = Object.entries(orders.byStatus || {})

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Título */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Resumen general de TechStore
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon="payments"
          label="Ingresos totales"
          value={`$${FORMAT_CURRENCY(revenue.total)}`}
          sub={`$${FORMAT_CURRENCY(revenue.month)} este mes`}
          color="text-green-400"
          trend={revenue.growth}
        />
        <StatCard
          icon="receipt_long"
          label="Pedidos totales"
          value={orders.total.toLocaleString()}
          sub={`${orders.month} este mes`}
          color="text-blue-400"
        />
        <StatCard
          icon="group"
          label="Clientes registrados"
          value={users.total.toLocaleString()}
          sub={`+${users.month} este mes`}
          color="text-purple-400"
        />
        <StatCard
          icon="warning"
          label="Productos con bajo stock"
          value={lowStock.length}
          sub={lowStock.length === 0 ? 'Todo en orden ✓' : 'Requieren atención'}
          color={lowStock.length > 0 ? 'text-amber-400' : 'text-green-400'}
        />
      </div>

      {/* ── Pedidos por estado ── */}
      <div className="bg-surface-dark border border-border-dark rounded-2xl p-5">
        <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">donut_large</span>
          Estado de pedidos
        </h2>
        {orderStatusEntries.length === 0 ? (
          <p className="text-slate-600 text-sm">No hay pedidos aún.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {orderStatusEntries.map(([status, count]) => (
              <div key={status} className={`rounded-xl p-3 flex flex-col gap-1 ${STATUS_BG[status] || 'bg-slate-800'}`}>
                <span className={`font-black text-xl ${STATUS_COLOR[status] || 'text-white'}`}>{count}</span>
                <span className="text-slate-500 text-[11px] leading-tight">{STATUS_LABEL[status] || status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Fila: Pedidos recientes + Bajo stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pedidos recientes */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
              Pedidos recientes
            </h2>
            <Link to="/admin/pedidos" className="text-primary text-xs font-bold hover:underline">
              Ver todos →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600">
              <span className="material-symbols-outlined text-[32px] mb-2">receipt_long</span>
              <p className="text-sm">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {recentOrders.slice(0, 6).map(order => (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold font-mono">{order.orderNumber}</p>
                    <p className="text-slate-500 text-xs truncate">{order.user?.name}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]} ${STATUS_BG[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                  <span className="text-white text-sm font-bold shrink-0 ml-2">
                    ${FORMAT_CURRENCY(Number(order.total))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bajo stock */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] ${lowStock.length > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                {lowStock.length > 0 ? 'warning' : 'check_circle'}
              </span>
              Bajo stock
            </h2>
            <Link to="/admin/productos" className="text-primary text-xs font-bold hover:underline">
              Gestionar →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
              <span className="material-symbols-outlined text-[32px] text-green-500/50">check_circle</span>
              <p className="text-sm">Todos los productos tienen stock suficiente</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="size-10 rounded-lg bg-background-dark border border-border-dark shrink-0 overflow-hidden flex items-center justify-center">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                      : <span className="material-symbols-outlined text-slate-600 text-[18px]">developer_board</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{p.name}</p>
                    <p className="text-slate-500 text-xs">{p.brand}</p>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${
                    p.stock === 0
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top productos más vendidos ── */}
      {topProducts.length > 0 && (
        <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border-dark">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
              Productos más vendidos
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {topProducts.map((p, i) => (
              <div
                key={p.id || i}
                className="flex flex-col items-center gap-2 p-3 bg-background-dark rounded-xl border border-border-dark text-center"
              >
                <span className="text-slate-600 text-[10px] font-bold">#{i + 1}</span>
                <div className="size-12 rounded-lg bg-surface-dark flex items-center justify-center overflow-hidden">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                    : <span className="material-symbols-outlined text-slate-600 text-[20px]">developer_board</span>
                  }
                </div>
                <p className="text-white text-xs font-bold line-clamp-2 leading-snug">{p.name || '—'}</p>
                <span className="text-primary text-xs font-black">{p.totalSold ?? 0} vendidos</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
