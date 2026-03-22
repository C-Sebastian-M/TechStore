import { useState, useEffect }  from 'react'
import { useNavigate }          from 'react-router-dom'
import { useAuth }              from '../context/AuthContext.jsx'
import * as authService         from '../services/authService.js'
import * as productService      from '../services/productService.js'
import * as orderService        from '../services/orderService.js'

// ─── Subcomponentes de cada tab (features/user/) ──────────────────────────────
import PersonalTab      from '../features/user/components/PersonalTab.jsx'
import AddressTab       from '../features/user/components/AddressTab.jsx'
import NotificationsTab from '../features/user/components/NotificationsTab.jsx'
import SecurityTab      from '../features/user/components/SecurityTab.jsx'

const TABS = [
  { id: 'personal',      label: 'Datos personales',   icon: 'person'         },
  { id: 'address',       label: 'Dirección de envío', icon: 'local_shipping' },
  { id: 'notifications', label: 'Notificaciones',     icon: 'notifications'  },
  { id: 'security',      label: 'Seguridad',          icon: 'shield'         },
]

export default function Profile() {
  const { user, logout, openLogin, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('personal')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Estado de los formularios ─────────────────────────────────────────────
  const [personalData, setPersonalData] = useState({
    name: '', email: '', phone: '', birthdate: '',
  })

  const [addressData, setAddressData] = useState({
    fullName: '', address: '', city: '', country: 'Colombia', zipCode: '',
  })

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ orders: null, favorites: null })

  // ── Cargar datos desde la API al montar ───────────────────────────────────
  useEffect(() => {
    if (!user) return

    authService.getProfile()
      .then(profile => {
        setPersonalData({
          name:      profile.name      || '',
          email:     profile.email     || '',
          phone:     profile.phone     || '',
          birthdate: profile.birthDate ? profile.birthDate.slice(0, 10) : '',
        })
        const addr = profile.addresses?.[0]
        if (addr) {
          setAddressData({
            fullName: addr.fullName   || '',
            address:  addr.address    || '',
            city:     addr.city       || '',
            country:  addr.country    || 'Colombia',
            zipCode:  addr.postalCode || '',
          })
        }
      })
      .catch(() => setPersonalData(p => ({ ...p, name: user.name, email: user.email })))

    orderService.getMyOrders()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        setStats(s => ({ ...s, orders: list.length }))
      })
      .catch(() => setStats(s => ({ ...s, orders: 0 })))

    productService.getFavorites()
      .then(favs => setStats(s => ({ ...s, favorites: Array.isArray(favs) ? favs.length : 0 })))
      .catch(() => setStats(s => ({ ...s, favorites: 0 })))

  }, [user?.id])

  // ── Guard: usuario no autenticado ─────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-background-dark px-4 py-20 text-center">
        <span className="material-symbols-outlined text-[56px] text-slate-700 mb-4">lock</span>
        <h2 className="text-white font-black text-2xl mb-2">Acceso restringido</h2>
        <p className="text-slate-500 mb-6">Debes iniciar sesión para ver tu perfil.</p>
        <button onClick={openLogin} className="h-10 px-6 bg-primary rounded-lg text-white font-bold text-sm hover:bg-blue-600 transition-colors">
          Iniciar sesión
        </button>
      </div>
    )
  }

  // ── Guardar datos personales / dirección ──────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      if (activeTab === 'personal') {
        await authService.updateProfile({
          name:      personalData.name,
          phone:     personalData.phone     || undefined,
          birthdate: personalData.birthdate || undefined,
        })
        await refreshUser()
      } else if (activeTab === 'address') {
        const profile      = await authService.getProfile()
        const existingAddr = profile.addresses?.[0]
        const payload = {
          fullName:   addressData.fullName,
          address:    addressData.address,
          city:       addressData.city,
          country:    addressData.country,
          postalCode: addressData.zipCode || undefined,
        }
        if (existingAddr) await authService.updateAddress(existingAddr.id, payload)
        else              await authService.addAddress({ ...payload, isDefault: true })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.message || 'Error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-grow bg-background-dark min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Cabecera ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10">
          <div className="size-24 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-black text-4xl select-none">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-green-400 inline-block" />
                Cuenta activa
              </span>
              {user.role === 'ADMIN' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[11px]">admin_panel_settings</span>
                  Administrador
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/pedidos')}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border-dark bg-surface-dark text-slate-300 text-sm font-bold hover:border-primary/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              Mis Pedidos
            </button>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Salir
            </button>
          </div>
        </div>

        {/* ── Grid sidebar + contenido ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

          {/* Sidebar de tabs */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSaveError('') }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-surface-dark border border-border-dark text-slate-400 hover:text-white hover:border-primary/40'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido del tab activo */}
          <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden">

            {activeTab === 'personal'      && <PersonalTab      personalData={personalData} setPersonalData={setPersonalData} stats={stats} />}
            {activeTab === 'address'       && <AddressTab        addressData={addressData}   setAddressData={setAddressData}  />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'security'      && <SecurityTab />}

            {/* Botón guardar — solo en tabs con formulario de datos */}
            {(activeTab === 'personal' || activeTab === 'address') && (
              <div className="px-6 pb-6 flex flex-col gap-2">
                {saveError && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {saveError}
                  </p>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 h-10 px-6 bg-primary hover:bg-blue-600 disabled:opacity-60 rounded-xl text-white font-black text-sm transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  {saving ? (
                    <><span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>Guardando...</>
                  ) : saved ? (
                    <><span className="material-symbols-outlined text-[18px]">check_circle</span>¡Guardado!</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">save</span>Guardar cambios</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
