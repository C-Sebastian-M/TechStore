// ─── PersonalTab ──────────────────────────────────────────────────────────────
// Tab de datos personales del perfil de usuario.
// Recibe los datos y callbacks del componente padre (Profile.jsx).

import { useNavigate } from 'react-router-dom'

export default function PersonalTab({ personalData, setPersonalData, stats }) {
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <h2 className="text-white font-black text-lg mb-1">Datos personales</h2>
      <p className="text-slate-500 text-sm mb-6">Actualiza tu información básica de cuenta.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Nombre completo',     key: 'name',      type: 'text',  icon: 'person', placeholder: 'Tu nombre completo'  },
          { label: 'Correo electrónico',  key: 'email',     type: 'email', icon: 'email',  placeholder: 'correo@ejemplo.com', readOnly: true },
          { label: 'Teléfono',            key: 'phone',     type: 'tel',   icon: 'phone',  placeholder: '+57 300 000 0000'    },
          { label: 'Fecha de nacimiento', key: 'birthdate', type: 'date',  icon: 'cake',   placeholder: ''                    },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {field.label}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                {field.icon}
              </span>
              <input
                type={field.type}
                value={personalData[field.key]}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                onChange={e => !field.readOnly && setPersonalData(p => ({ ...p, [field.key]: e.target.value }))}
                className={`w-full bg-background-dark border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-primary focus:outline-none transition-colors ${field.readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mt-8">
        {[
          { label: 'Pedidos',   value: stats.orders    ?? '—', icon: 'inventory_2', color: 'text-primary',   link: '/pedidos'   },
          { label: 'Favoritos', value: stats.favorites ?? '—', icon: 'favorite',    color: 'text-red-400',   link: '/favoritos' },
          { label: 'Reseñas',   value: '—',                    icon: 'star',        color: 'text-amber-400', link: null         },
        ].map(stat => (
          <div
            key={stat.label}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-background-dark rounded-xl p-4 flex flex-col items-center gap-1 border border-border-dark transition-colors ${stat.link ? 'hover:border-primary/40 cursor-pointer' : ''}`}
          >
            <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
            <span className="text-white font-black text-xl">
              {stats.orders === null && stat.label !== 'Reseñas'
                ? <span className="inline-block w-4 h-4 animate-spin rounded-full border-2 border-border-dark border-t-slate-400" />
                : stat.value
              }
            </span>
            <span className="text-slate-600 text-[11px]">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
