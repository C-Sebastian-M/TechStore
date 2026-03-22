import { useState, useEffect, useCallback, useRef } from 'react'
import * as adminService from '../../services/adminService.js'
import { FORMAT_CURRENCY } from '../../constants'

// ─── Extensiones y tamaño recomendados ─────────────────────────────────
//  ★ WebP  — preferido: hasta 35% más liviano que JPEG, soportado en todos los browsers
//  • JPG/JPEG — fotos y texturas, buena compresión
//  • PNG  — solo si necesitas fondo transparente
//  ✕ GIF  — aceptado pero pesado; usa WebP animado si necesitas animaciones
//  Máx. 5 MB antes de procesar (el servidor lo convierte a WebP 800px)
const ACCEPT = '.webp,.jpg,.jpeg,.png,.gif'
const MAX_MB  = 5

// ─── Componente ImageUploader ───────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const [mode,       setMode]       = useState(value?.startsWith('http') || value?.startsWith('/uploads') ? 'preview' : 'empty')
  const [uploading,  setUploading]  = useState(false)
  const [uploadErr,  setUploadErr]  = useState('')
  const [urlInput,   setUrlInput]   = useState('')
  const [showUrl,    setShowUrl]    = useState(false)
  const [dragging,   setDragging]   = useState(false)
  const fileRef = useRef(null)

  // Sincronizar si el valor cambia externamente (edición)
  useEffect(() => {
    if (value) setMode('preview')
    else       setMode('empty')
  }, [value])

  const processFile = async (file) => {
    if (!file) return
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setUploadErr('Formato no válido. Usa WebP, JPG, PNG o GIF.')
      return
    }
    // Validar tamaño
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadErr(`El archivo pesa más de ${MAX_MB} MB.`)
      return
    }
    setUploadErr('')
    setUploading(true)
    try {
      const url = await adminService.uploadProductImage(file)
      onChange(url)
      setMode('preview')
    } catch (err) {
      setUploadErr(err.message || 'Error al subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  const handleUrlSave = () => {
    if (!urlInput.trim()) return
    onChange(urlInput.trim())
    setUrlInput('')
    setShowUrl(false)
    setMode('preview')
  }

  const handleRemove = () => {
    onChange('')
    setMode('empty')
    setUploadErr('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      {mode === 'preview' && value ? (
        <div className="relative group">
          <div className="w-full h-40 rounded-xl border border-border-dark bg-background-dark flex items-center justify-center overflow-hidden">
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-contain p-2"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
          {/* Overlay con acciones */}
          <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 h-8 px-3 bg-primary rounded-lg text-white text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">upload</span>
              Cambiar archivo
            </button>
            <button
              type="button"
              onClick={() => setShowUrl(v => !v)}
              className="flex items-center gap-1.5 h-8 px-3 bg-surface-dark border border-border-dark rounded-lg text-white text-xs font-bold hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">link</span>
              Usar URL
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="size-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
              title="Quitar imagen"
            >
              <span className="material-symbols-outlined text-[15px]">delete</span>
            </button>
          </div>
        </div>
      ) : (
        // Zona de drop
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragging
              ? 'border-primary bg-primary/10'
              : 'border-border-dark bg-background-dark hover:border-primary/60 hover:bg-primary/5'
          }`}
        >
          {uploading ? (
            <>
              <span className="animate-spin material-symbols-outlined text-[36px] text-primary">progress_activity</span>
              <p className="text-slate-400 text-xs">Subiendo y optimizando...</p>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[36px] text-slate-600">add_photo_alternate</span>
              <p className="text-slate-400 text-sm font-bold">
                {dragging ? 'Suelta aquí' : 'Arrastra una imagen o haz clic'}
              </p>
              <p className="text-slate-600 text-xs">
                WebP ★ · JPG · PNG · GIF &nbsp;·&nbsp; Máx. {MAX_MB} MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Input de URL alternativo */}
      {(showUrl || mode === 'empty') && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlSave())}
            placeholder="O pega una URL de imagen..."
            className="flex-1 bg-background-dark border border-border-dark text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:border-primary outline-none"
          />
          <button
            type="button"
            onClick={handleUrlSave}
            disabled={!urlInput.trim()}
            className="h-9 px-3 bg-surface-dark border border-border-dark rounded-xl text-slate-300 text-xs font-bold hover:border-primary hover:text-white disabled:opacity-40 transition-colors"
          >
            Usar URL
          </button>
        </div>
      )}

      {/* Recomendación de formato */}
      <p className="text-slate-600 text-xs flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px] text-amber-500">tips_and_updates</span>
        Recomendado: <strong className="text-slate-500">WebP</strong> — hasta 35% más liviano que JPG con la misma calidad.
        El servidor convierte automáticamente cualquier formato a WebP 800×800 px.
      </p>

      {/* Error de upload */}
      {uploadErr && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">error</span>
          {uploadErr}
        </p>
      )}

      {/* Input file oculto */}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ── Modal de crear/editar producto ────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name:        product?.name        || '',
    brand:       product?.brand       || '',
    description: product?.description || '',
    price:       product?.price       || '',
    oldPrice:    product?.oldPrice    || '',
    stock:       product?.stock       ?? 0,
    image:       product?.image       || '',
    badge:       product?.badge       || '',
    badgeColor:  product?.badgeColor  || '',
    specs:       Array.isArray(product?.specs) ? product.specs.join('\n') : '',
    categoryId:  product?.categoryId  || (categories[0]?.id ?? ''),
    isActive:    product?.isActive    ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name:        form.name,
        brand:       form.brand,
        description: form.description,
        price:       Number(form.price),
        oldPrice:    form.oldPrice ? Number(form.oldPrice) : null,
        stock:       Number(form.stock),
        image:       form.image || null,
        badge:       form.badge || null,
        badgeColor:  form.badgeColor || null,
        specs:       form.specs.split('\n').map(s => s.trim()).filter(Boolean),
        categoryId:  form.categoryId,
        isActive:    form.isActive,
      }
      if (isEdit) {
        await adminService.updateProduct(product.id, payload)
      } else {
        await adminService.createProduct(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-background-dark border border-border-dark text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:border-primary outline-none transition-colors'
  const labelCls = 'block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark shrink-0">
          <h2 className="text-white font-black text-lg">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nombre *</label>
              <input className={inputCls} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: RTX 4090 Gaming X Trio" />
            </div>
            <div>
              <label className={labelCls}>Marca *</label>
              <input className={inputCls} required value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Ej: MSI" />
            </div>
            <div>
              <label className={labelCls}>Categoría *</label>
              <select className={inputCls} required value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Precio (USD) *</label>
              <input className={inputCls} type="number" step="0.01" min="0" required value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Precio anterior (tachado)</label>
              <input className={inputCls} type="number" step="0.01" min="0" value={form.oldPrice} onChange={e => set('oldPrice', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Stock</label>
              <input className={inputCls} type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Badge (ej: NEW, HOT, -15%)</label>
              <input className={inputCls} value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="NEW" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Imagen del producto</label>
              <ImageUploader
                value={form.image}
                onChange={url => set('image', url)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descripción *</label>
              <textarea className={inputCls} rows={3} required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción del producto..." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Especificaciones (una por línea)</label>
              <textarea className={inputCls} rows={4} value={form.specs} onChange={e => set('specs', e.target.value)} placeholder={'16GB GDDR6X\nPCIe 4.0\nTriple Fan'} />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <span
                  className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: form.isActive ? 'translateX(20px)' : 'translateX(0px)' }}
                />
              </button>
              <span className="text-sm text-slate-300">{form.isActive ? 'Producto activo (visible)' : 'Producto oculto'}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-dark shrink-0">
          <button onClick={onClose} className="h-10 px-5 rounded-xl border border-border-dark text-slate-300 text-sm font-bold hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="h-10 px-6 bg-primary rounded-xl text-white text-sm font-black hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {saving && <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [modal,      setModal]      = useState(null) // null | 'create' | product obj
  const [deleting,   setDeleting]   = useState(null)
  const [toast,      setToast]      = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Pasamos isActive al servidor según el filtro elegido
      // includeInactive: true siempre (lo añade adminService por defecto)
      // Si el filtro es 'active' pasamos isActive=true; 'inactive' → isActive=false
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        ...(statusFilter === 'active'   && { isActive: true  }),
        ...(statusFilter === 'inactive' && { isActive: false }),
      }
      const res = await adminService.getAdminProducts(params)
      setProducts(res.data || [])
      setPagination(res.pagination || null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => {
    adminService.getAdminCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  // Reset página al buscar o filtrar
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const handleToggleActive = async (product) => {
    const action = product.isActive ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} "${product.name}"?`)) return
    setDeleting(product.id)
    try {
      if (product.isActive) {
        await adminService.deleteProduct(product.id)
        showToast('Producto desactivado.')
      } else {
        await adminService.updateProduct(product.id, { isActive: true })
        showToast('Producto reactivado.')
      }
      load()
    } catch (err) {
      showToast(err.message || 'Error al actualizar.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination?.total ?? '—'} productos en total</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 h-10 px-5 bg-primary rounded-xl text-white text-sm font-black hover:bg-blue-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            className="w-full bg-surface-dark border border-border-dark text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none"
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface-dark border border-border-dark text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Solo activos</option>
          <option value="inactive">Solo inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark bg-background-dark/40">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-500">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
                  </div>
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-500">
                  Sin productos
                </td></tr>
              ) : products.map(p => (
                <tr key={p.id} className={`hover:bg-white/5 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-background-dark border border-border-dark shrink-0 overflow-hidden flex items-center justify-center">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                          : <span className="material-symbols-outlined text-slate-600 text-[16px]">developer_board</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate max-w-[200px]">{p.name}</p>
                        <p className="text-slate-500 text-xs">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-bold">${FORMAT_CURRENCY(Number(p.price))}</span>
                    {p.oldPrice && <span className="block text-slate-600 text-xs line-through">${FORMAT_CURRENCY(Number(p.oldPrice))}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-amber-400' : 'text-white'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'text-green-400 bg-green-400/10' : 'text-slate-500 bg-slate-800'}`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setModal(p)}
                        className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={deleting === p.id}
                        title={p.isActive ? 'Desactivar producto' : 'Reactivar producto'}
                        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                          deleting === p.id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        } ${
                          p.isActive ? 'bg-primary' : 'bg-slate-700'
                        }`}
                      >
                        {deleting === p.id
                          ? <span className="absolute inset-0 flex items-center justify-center">
                              <span className="animate-spin material-symbols-outlined text-white text-[12px]">progress_activity</span>
                            </span>
                          : <span
                              className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform"
                              style={{ transform: p.isActive ? 'translateX(16px)' : 'translateX(0px)' }}
                            />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
            <span className="text-slate-500 text-xs">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} productos)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-lg border border-border-dark text-slate-400 text-xs font-bold disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="h-8 px-3 rounded-lg border border-border-dark text-slate-400 text-xs font-bold disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); showToast(modal === 'create' ? 'Producto creado.' : 'Producto actualizado.') }}
        />
      )}
    </div>
  )
}
