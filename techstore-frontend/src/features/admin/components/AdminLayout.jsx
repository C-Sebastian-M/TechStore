import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useState } from 'react'

// ─── AdminLayout ──────────────────────────────────────────────────────────────
// Layout raíz del panel de administración.
// Incluye guard de autenticación, sidebar colapsable y topbar.

const NAV = [
  { to: '/admin',            label: 'Dashboard',  icon: 'dashboard',   end: true },
  { to: '/admin/productos',  label: 'Productos',  icon: 'inventory_2'            },
  { to: '/admin/categorias', label: 'Categorías', icon: 'category'               },
  { to: '/admin/pedidos',    label: 'Pedidos',    icon: 'receipt_long'           },
  { to: '/admin/usuarios',   label: 'Usuarios',   icon: 'group'                  },
]

export default function AdminLayout() {
  const { user, loading, logout } = useAuth()
  const navigate   = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen bg-background-dark overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`flex flex-col shrink-0 bg-surface-dark border-r border-border-dark transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>

        <div className="flex items-center gap-3 px-4 h-16 border-b border-border-dark shrink-0">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-black text-sm leading-none">TechStore</p>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto size-7 flex items-center justify-center rounded text-slate-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-border-dark shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-colors">
            <span className="material-symbols-outlined text-[20px] shrink-0">storefront</span>
            {!collapsed && <span>Ver tienda</span>}
          </button>
          <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-bold transition-colors mt-1">
            <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Área principal ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-16 shrink-0 border-b border-border-dark bg-surface-dark/60 backdrop-blur-sm flex items-center px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-sm select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-bold leading-none">{user.name}</p>
              <p className="text-primary text-[10px] font-bold uppercase tracking-wider mt-0.5">Administrador</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
