import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as adminService from '../../services/adminService.js'
import { FORMAT_CURRENCY } from '../../constants'

function UserDetailModal({ userId, currentAdminId, onClose, onUpdated }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    adminService.getAdminUser(userId)
      .then(setUser)
      .catch(() => setError('No se pudo cargar el usuario.'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleRoleToggle = async () => {
    if (!user) return
    const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
    if (!window.confirm(`¿Cambiar rol de "${user.name}" a ${newRole}?`)) return
    setSaving(true); setError('')
    try {
      const updated = await adminService.updateUserRole(userId, newRole)
      setUser(u => ({ ...u, role: updated.role }))
      onUpdated()
    } catch (err) { setError(err.message || 'Error al cambiar rol.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar la cuenta de "${user?.name}"? Esta acción no se puede deshacer.`)) return
    setSaving(true)
    try {
      await adminService.deleteUser(userId)
      onUpdated()
      onClose()
    } catch (err) { setError(err.message || 'Error al eliminar.') }
    finally { setSaving(false) }
  }

  const STATUS_COLOR = {
    RECEIVED: 'text-slate-400', PAYMENT_CONFIRMED: 'text-purple-400',
    PREPARING: 'text-amber-400', SHIPPED: 'text-blue-400',
    DELIVERED: 'text-green-400', CANCELLED: 'text-red-400',
  }
  const STATUS_LABEL = {
    RECEIVED: 'Recibido', PAYMENT_CONFIRMED: 'Pago confirmado',
    PREPARING: 'Preparando', SHIPPED: 'En camino',
    DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark shrink-0">
          <h2 className="text-white font-black text-lg">Detalle de usuario</h2>
          <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
            </div>
          ) : !user ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Perfil */}
              <div className="flex items-center gap-4 bg-background-dark rounded-xl p-4">
                <div className="size-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-2xl shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-lg">{user.name}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  {user.phone && <p className="text-slate-500 text-xs">{user.phone}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-slate-700 text-slate-300'}`}>
                  {user.role}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Pedidos', value: user._count?.orders ?? user.orders?.length ?? 0, icon: 'receipt_long', color: 'text-primary' },
                  { label: 'Miembro desde', value: new Date(user.createdAt).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }), icon: 'calendar_month', color: 'text-purple-400' },
                  { label: 'Gasto total', value: `$${FORMAT_CURRENCY(user.orders?.reduce((s, o) => s + Number(o.total), 0) || 0)}`, icon: 'payments', color: 'text-green-400' },
                ].map(s => (
                  <div key={s.label} className="bg-background-dark rounded-xl p-3 flex flex-col gap-1 text-center">
                    <span className={`material-symbols-outlined text-[18px] ${s.color} mx-auto`}>{s.icon}</span>
                    <span className="text-white font-black text-sm">{s.value}</span>
                    <span className="text-slate-600 text-[10px]">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Acciones */}
              {userId !== currentAdminId && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRoleToggle}
                    disabled={saving}
                    className="flex items-center gap-2 h-9 px-4 rounded-lg border border-primary/40 text-primary text-sm font-bold hover:bg-primary/10 disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                    {user.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center gap-2 h-9 px-4 rounded-lg border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_remove</span>
                    Eliminar cuenta
                  </button>
                </div>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}

              {/* Últimos pedidos */}
              {user.orders?.length > 0 && (
                <div>
                  <p className="text-white font-bold text-sm mb-3">Últimos pedidos</p>
                  <div className="flex flex-col gap-2">
                    {user.orders.map(o => (
                      <div key={o.id} className="flex items-center gap-3 bg-background-dark rounded-xl p-3 border border-border-dark">
                        <span className="text-white font-mono text-xs font-bold flex-1">{o.orderNumber}</span>
                        <span className={`text-xs font-bold ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                        <span className="text-primary font-bold text-sm shrink-0">${FORMAT_CURRENCY(Number(o.total))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [users,      setUsers]      = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page,       setPage]       = useState(1)
  const [detail,     setDetail]     = useState(null)
  const [toast,      setToast]      = useState('')

  // Obtenemos el ID del admin actual del contexto de autenticación
  const { user: adminUser } = useAuth()
  const currentAdminId = adminUser?.id ?? null

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getAdminUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined })
      setUsers(res.data || [])
      setPagination(res.pagination || null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, roleFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, roleFilter])

  return (
    <div className="p-6 flex flex-col gap-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-white">Usuarios</h1>
        <p className="text-slate-500 text-sm mt-0.5">{pagination?.total ?? '—'} usuarios registrados</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            className="w-full bg-surface-dark border border-border-dark text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-surface-dark border border-border-dark text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary outline-none"
        >
          <option value="">Todos los roles</option>
          <option value="CUSTOMER">Clientes</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark bg-background-dark/40">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Pedidos</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Registro</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border-dark border-t-primary" /></div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-500">Sin usuarios</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{u.name}</p>
                        <p className="text-slate-500 text-xs truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-slate-700 text-slate-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white font-bold">{u._count?.orders ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDetail(u.id)}
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
        <UserDetailModal
          userId={detail}
          currentAdminId={currentAdminId}
          onClose={() => setDetail(null)}
          onUpdated={() => { load(); showToast('Usuario actualizado.') }}
        />
      )}
    </div>
  )
}
