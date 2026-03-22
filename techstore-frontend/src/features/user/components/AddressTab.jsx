// ─── AddressTab ───────────────────────────────────────────────────────────────
// Tab de dirección de envío del perfil de usuario.

export default function AddressTab({ addressData, setAddressData }) {
  return (
    <div className="p-6">
      <h2 className="text-white font-black text-lg mb-1">Dirección de envío</h2>
      <p className="text-slate-500 text-sm mb-6">Tu dirección principal para entregas.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Nombre completo', key: 'fullName', col: 'sm:col-span-2', icon: 'person',             placeholder: 'Nombre del destinatario'       },
          { label: 'Dirección',       key: 'address',  col: 'sm:col-span-2', icon: 'home',               placeholder: 'Calle, número, apartamento...' },
          { label: 'Ciudad',          key: 'city',     col: '',              icon: 'location_city',       placeholder: 'Medellín'                      },
          { label: 'País',            key: 'country',  col: '',              icon: 'public',              placeholder: 'Colombia'                      },
          { label: 'Código postal',   key: 'zipCode',  col: '',              icon: 'markunread_mailbox',  placeholder: '050001'                        },
        ].map(field => (
          <div key={field.key} className={field.col}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {field.label}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                {field.icon}
              </span>
              <input
                type="text"
                value={addressData[field.key]}
                placeholder={field.placeholder}
                onChange={e => setAddressData(p => ({ ...p, [field.key]: e.target.value }))}
                className="w-full bg-background-dark border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border-dark bg-background-dark h-36 flex items-center justify-center gap-3 text-slate-600">
        <span className="material-symbols-outlined text-[28px]">map</span>
        <span className="text-sm">Integración de mapa disponible próximamente</span>
      </div>
    </div>
  )
}
