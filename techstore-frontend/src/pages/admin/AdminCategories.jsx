import { useState, useEffect } from 'react'
import * as adminService from '../../services/adminService.js'

function CategoryModal({ category, onClose, onSaved }) {
  const isEdit = !!category
  const [form, setForm] = useState({
    name:  category?.name  || '',
    slug:  category?.slug  || '',
    image: category?.image || '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const autoSlug = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const handleName = (val) => {
    setForm(f => ({ ...f, name: val, slug: isEdit ? f.slug : autoSlug(val) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (isEdit) await adminService.updateCategory(category.id, form)
      else        await adminService.createCategory(form)
      onSaved()
    } catch (err) { setError(err.message || 'Error al guardar.') }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full bg-background-dark border border-border-dark text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:border-primary outline-none'
  const labelCls = 'block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark">
          <h2 className="text-white font-black text-lg">{isEdit ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Nombre *</label>
            <input className={inputCls} required value={form.name} onChange={e => handleName(e.target.value)} placeholder="Ej: Tarjetas de Video" />
          </div>
          <div>
            <label className={labelCls}>Slug (URL amigable) *</label>
            <input className={inputCls} required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="tarjetas-de-video" />
            <p className="text-slate-600 text-xs mt-1">Solo letras minúsculas, números y guiones</p>
          </div>
          <div>
            <label className={labelCls}>URL de imagen (opcional)</label>
            <input className={inputCls} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
          </div>
          {form.image && (
            <img src={form.image} alt="preview" className="h-20 object-contain rounded-xl bg-background-dark border border-border-dark p-2" onError={e => e.target.style.display='none'} />
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-5 rounded-xl border border-border-dark text-slate-300 text-sm font-bold hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="h-10 px-6 bg-primary rounded-xl text-white text-sm font-black hover:bg-blue-600 disabled:opacity-60 flex items-center gap-2">
              {saving && <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>}
              {isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal,   setModal]         = useState(null)
  const [toast,   setToast]         = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    setLoading(true)
    adminService.getAdminCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  const handleDelete = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}"?`)) return
    try {
      await adminService.deleteCategory(cat.id)
      showToast('Categoría eliminada.')
      load()
    } catch (err) {
      alert(err.message || 'Error al eliminar.')
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Categorías</h1>
          <p className="text-slate-500 text-sm mt-0.5">{categories.length} categorías</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 h-10 px-5 bg-primary rounded-xl text-white text-sm font-black hover:bg-blue-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden group">
              <div className="aspect-video bg-background-dark flex items-center justify-center overflow-hidden relative">
                {cat.image
                  ? <img src={cat.image} alt={cat.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" onError={e => e.target.style.display='none'} />
                  : <span className="material-symbols-outlined text-[48px] text-slate-700">category</span>
                }
              </div>
              <div className="p-4">
                <h3 className="text-white font-black">{cat.name}</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-mono">{cat.slug}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400 bg-background-dark px-2 py-1 rounded-lg">
                    {cat._count?.products ?? 0} productos
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModal(cat)}
                      className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CategoryModal
          category={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); showToast(modal === 'create' ? 'Categoría creada.' : 'Categoría actualizada.') }}
        />
      )}
    </div>
  )
}
