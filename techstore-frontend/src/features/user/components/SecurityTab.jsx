import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import * as authService from '../../../services/authService.js'

export default function SecurityTab() {
  const { user } = useAuth()
  const isGoogleUser = !!user?.googleAuth

  // ── Estado formulario cambio/establecer contraseña ────────────────────────
  const [pwData, setPwData] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [saved,  setSaved]  = useState(false)

  const validate = () => {
    if (!isGoogleUser && !pwData.current) { setError('Ingresa tu contraseña actual.'); return false }
    if (!pwData.next)                      { setError('Ingresa la nueva contraseña.'); return false }
    if (pwData.next.length < 8)            { setError('Mínimo 8 caracteres.'); return false }
    if (!/\d/.test(pwData.next))           { setError('Debe contener al menos un número.'); return false }
    if (pwData.next !== pwData.confirm)    { setError('Las contraseñas no coinciden.'); return false }
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!validate()) return
    setSaving(true)
    try {
      if (isGoogleUser) {
        await authService.setPassword(pwData.next)
      } else {
        await authService.changePassword(pwData.current, pwData.next)
      }
      setSaved(true)
      setPwData({ current: '', next: '', confirm: '' })
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.')
    } finally {
      setSaving(false)
    }
  }

  // Campos a mostrar según tipo de usuario
  const fields = isGoogleUser
    ? [
        { label: 'Nueva contraseña',           key: 'next',    placeholder: 'Mín. 8 caracteres, 1 número' },
        { label: 'Confirmar nueva contraseña', key: 'confirm', placeholder: '••••••••'                     },
      ]
    : [
        { label: 'Contraseña actual',          key: 'current', placeholder: '••••••••'                     },
        { label: 'Nueva contraseña',           key: 'next',    placeholder: 'Mín. 8 caracteres, 1 número' },
        { label: 'Confirmar nueva contraseña', key: 'confirm', placeholder: '••••••••'                     },
      ]

  return (
    <div className="p-6">
      <h2 className="text-white font-black text-lg mb-1">Seguridad</h2>
      <p className="text-slate-500 text-sm mb-6">Gestiona tu contraseña y acceso a la cuenta.</p>

      <div className="flex flex-col gap-4">

        {/* ── Banner Google ─────────────────────────────────────────────────── */}
        {isGoogleUser && (
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <p className="text-blue-300 font-bold text-sm">Cuenta vinculada con Google</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Te registraste con Google. Puedes establecer una contraseña para poder iniciar sesión también con email y contraseña.
              </p>
            </div>
          </div>
        )}

        {/* ── Formulario contraseña ─────────────────────────────────────────── */}
        <div className="bg-background-dark rounded-xl border border-border-dark p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
            {isGoogleUser ? 'Establecer contraseña' : 'Cambiar contraseña'}
          </h3>

          <div className="flex flex-col gap-3">
            {fields.map(field => (
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
              {isGoogleUser
                ? 'Contraseña establecida. Ya puedes iniciar sesión con email y contraseña.'
                : 'Contraseña actualizada correctamente.'}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-4 flex items-center gap-2 h-9 px-5 bg-primary rounded-lg text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-60 transition-colors"
          >
            {saving && <span className="animate-spin material-symbols-outlined text-[15px]">progress_activity</span>}
            {isGoogleUser ? 'Establecer contraseña' : 'Actualizar contraseña'}
          </button>
        </div>

        {/* ── Sesión actual ─────────────────────────────────────────────────── */}
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

        {/* ── Zona de peligro ───────────────────────────────────────────────── */}
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
