// ─── SecurityTab ──────────────────────────────────────────────────────────────
// Tab de seguridad del perfil: cambio de contraseña y zona de peligro.
// Encapsula todo el estado y la lógica del formulario de contraseña.

import { useState } from 'react'
import * as authService from '../../../services/authService.js'

export default function SecurityTab() {
  const [pwData, setPwData] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [saved,  setSaved]  = useState(false)

  const handleChangePassword = async () => {
    setError('')

    // Validación en el frontend antes de llamar a la API
    if (!pwData.current || !pwData.next || !pwData.confirm) {
      setError('Completa todos los campos.')
      return
    }
    if (pwData.next.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!/\d/.test(pwData.next)) {
      setError('La nueva contraseña debe contener al menos un número.')
      return
    }
    if (pwData.next !== pwData.confirm) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    setSaving(true)
    try {
      await authService.changePassword(pwData.current, pwData.next)
      setSaved(true)
      setPwData({ current: '', next: '', confirm: '' })
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña. Verifica la contraseña actual.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-white font-black text-lg mb-1">Seguridad</h2>
      <p className="text-slate-500 text-sm mb-6">Gestiona tu contraseña y acceso a la cuenta.</p>

      <div className="flex flex-col gap-4">

        {/* ── Cambiar contraseña ───────────────────────────────────────────── */}
        <div className="bg-background-dark rounded-xl border border-border-dark p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
            Cambiar contraseña
          </h3>

          <div className="flex flex-col gap-3">
            {[
              { label: 'Contraseña actual',          key: 'current', placeholder: '••••••••'                        },
              { label: 'Nueva contraseña',           key: 'next',    placeholder: 'Mín. 8 caracteres, 1 número'    },
              { label: 'Confirmar nueva contraseña', key: 'confirm', placeholder: '••••••••'                        },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{field.label}</label>
                <input
                  type="password"
                  value={pwData[field.key]}
                  placeholder={field.placeholder}
                  onChange={e => setPwData(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs">
              <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">error</span>
              {error}
            </div>
          )}

          {saved && (
            <div className="mt-3 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2.5 text-green-400 text-xs">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              Contraseña actualizada correctamente.
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="mt-4 flex items-center gap-2 h-9 px-5 bg-primary rounded-lg text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-60 transition-colors"
          >
            {saving && <span className="animate-spin material-symbols-outlined text-[15px]">progress_activity</span>}
            Actualizar contraseña
          </button>
        </div>

        {/* ── Sesión actual ────────────────────────────────────────────────── */}
        <div className="bg-background-dark rounded-xl border border-border-dark p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">devices</span>
            Sesión actual
          </h3>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500 text-[28px]">computer</span>
              <div>
                <p className="text-white text-sm font-bold">Navegador Web</p>
                <p className="text-slate-500 text-xs">Activa ahora · Colombia</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Activa</span>
          </div>
        </div>

        {/* ── Zona de peligro ──────────────────────────────────────────────── */}
        <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-5">
          <h3 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Zona de peligro
          </h3>
          <p className="text-slate-500 text-xs mb-4">Esta acción es permanente y no se puede deshacer.</p>
          <button className="h-9 px-5 border border-red-500/40 rounded-lg text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors">
            Eliminar mi cuenta
          </button>
        </div>

      </div>
    </div>
  )
}
