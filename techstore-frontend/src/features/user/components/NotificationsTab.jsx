// ─── NotificationsTab ─────────────────────────────────────────────────────────
// Tab de preferencias de notificaciones del perfil de usuario.

import { useState } from 'react'

const ITEMS = [
  { key: 'orderUpdates', label: 'Actualizaciones de pedidos', desc: 'Estado de envío, confirmaciones y entregas.',  icon: 'inventory_2',  always: true  },
  { key: 'promotions',   label: 'Promociones y descuentos',   desc: 'Ofertas especiales y códigos exclusivos.',     icon: 'local_offer',  always: false },
  { key: 'newProducts',  label: 'Nuevos productos',           desc: 'Novedades en el catálogo y lanzamientos.',     icon: 'new_releases', always: false },
  { key: 'newsletter',   label: 'Newsletter TechStore',       desc: 'Contenido editorial y guías de compra.',       icon: 'mail',         always: false },
]

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promotions:   false,
    newProducts:  true,
    newsletter:   false,
  })

  return (
    <div className="p-6">
      <h2 className="text-white font-black text-lg mb-1">Preferencias de notificaciones</h2>
      <p className="text-slate-500 text-sm mb-6">Elige qué comunicaciones deseas recibir.</p>

      <div className="flex flex-col gap-3">
        {ITEMS.map(item => (
          <div key={item.key} className="flex items-center justify-between gap-4 bg-background-dark rounded-xl p-4 border border-border-dark">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-lg flex items-center justify-center ${prefs[item.key] ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-600'}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div>
                <p className="text-white text-sm font-bold">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
                {item.always && <span className="text-[10px] text-primary font-bold">Siempre activo</span>}
              </div>
            </div>
            <button
              type="button"
              disabled={item.always}
              onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${prefs[item.key] ? 'bg-primary' : 'bg-slate-700'} ${item.always ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: prefs[item.key] ? 'translateX(20px)' : 'translateX(0px)' }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
