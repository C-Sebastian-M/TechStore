import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ui/ProductCard'
import * as productService from '../services/productService.js'
import { Spinner, ErrorState } from '../hooks/useApi.jsx'

const SORT_OPTIONS = [
  { label: 'Más recientes',          value: 'createdAt:desc' },
  { label: 'Precio: Menor a Mayor',  value: 'price:asc'      },
  { label: 'Precio: Mayor a Menor',  value: 'price:desc'     },
  { label: 'Mejor evaluados',        value: 'rating:desc'    },
  { label: 'Nombre A-Z',             value: 'name:asc'       },
]

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Estado de filtros (sincronizado con la URL) ──────────────────────────
  const [search,   setSearch]   = useState(searchParams.get('search')   || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sortBy,   setSortBy]   = useState(searchParams.get('sort')     || 'createdAt:desc')
  const [priceMin, setPriceMin] = useState(searchParams.get('min')      || '')
  const [priceMax, setPriceMax] = useState(searchParams.get('max')      || '')
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1)
  const [viewGrid, setViewGrid] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  // ── Estado de datos ───────────────────────────────────────────────────────
  const [products,    setProducts]    = useState([])
  const [pagination,  setPagination]  = useState(null)
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  // ── Cargar categorías una sola vez ────────────────────────────────────────
  useEffect(() => {
    productService.getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  // ── Cargar productos cuando cambian los filtros ───────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [field, order] = sortBy.split(':')
      const result = await productService.getProducts({
        page,
        limit:      12,
        category:   category || undefined,
        search:     search   || undefined,
        minPrice:   priceMin || undefined,
        maxPrice:   priceMax || undefined,
        sortBy:     field,
        sortOrder:  order,
      })
      setProducts(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, category, search, sortBy, priceMin, priceMax])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // ── Sincronizar filtros con la URL ─────────────────────────────────────────
  useEffect(() => {
    const params = {}
    if (search)   params.search   = search
    if (category) params.category = category
    if (sortBy !== 'createdAt:desc') params.sort = sortBy
    if (priceMin) params.min  = priceMin
    if (priceMax) params.max  = priceMax
    if (page > 1) params.page = page
    setSearchParams(params, { replace: true })
  }, [search, category, sortBy, priceMin, priceMax, page, setSearchParams])

  const clearFilters = () => {
    setSearch(''); setCategory(''); setSortBy('createdAt:desc')
    setPriceMin(''); setPriceMax(''); setPage(1)
  }

  const hasActiveFilters = search || category || priceMin || priceMax

  // ── Sidebar de filtros ────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="flex flex-col w-full lg:w-64 shrink-0 gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-bold">Filtros</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-primary text-sm font-medium hover:underline">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="flex flex-col gap-2">
        <p className="text-white text-sm font-bold uppercase tracking-wider">Buscar</p>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">search</span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Nombre, marca..."
            className="w-full bg-surface-dark border border-border-dark text-white placeholder-slate-500 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="h-px bg-border-dark" />

      {/* Categorías */}
      <div className="flex flex-col gap-3">
        <p className="text-white text-sm font-bold uppercase tracking-wider">Categoría</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" name="category" checked={!category}
              onChange={() => { setCategory(''); setPage(1) }}
              className="text-primary focus:ring-primary/50 w-4 h-4"
            />
            <span className={`text-sm ${!category ? 'text-white font-medium' : 'text-slate-400'} group-hover:text-primary transition-colors`}>
              Todas
            </span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center justify-between gap-3 cursor-pointer group">
              <div className="flex items-center gap-3">
                <input type="radio" name="category" checked={category === cat.slug}
                  onChange={() => { setCategory(cat.slug); setPage(1) }}
                  className="text-primary focus:ring-primary/50 w-4 h-4"
                />
                <span className={`text-sm ${category === cat.slug ? 'text-white font-medium' : 'text-slate-400'} group-hover:text-primary transition-colors`}>
                  {cat.name}
                </span>
              </div>
              <span className="text-slate-600 text-xs">{cat._count?.products || 0}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-border-dark" />

      {/* Rango de precio */}
      <div className="flex flex-col gap-3">
        <p className="text-white text-sm font-bold uppercase tracking-wider">Precio (USD)</p>
        <div className="flex items-center gap-2">
          <input
            type="number" placeholder="Min" value={priceMin}
            onChange={e => { setPriceMin(e.target.value); setPage(1) }}
            className="w-full bg-surface-dark border border-border-dark text-white rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
          />
          <span className="text-slate-500">–</span>
          <input
            type="number" placeholder="Max" value={priceMax}
            onChange={e => { setPriceMax(e.target.value); setPage(1) }}
            className="w-full bg-surface-dark border border-border-dark text-white rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 gap-8">

      {/* Sidebar Desktop */}
      <div className="hidden lg:flex flex-col sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex flex-col flex-1 gap-6 min-w-0">

        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 text-sm">
          <Link to="/" className="text-slate-400 font-medium hover:text-primary transition-colors">Inicio</Link>
          <span className="text-slate-400">/</span>
          <span className="text-white font-medium">Productos</span>
        </div>

        {/* Encabezado + Sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-white text-3xl font-black tracking-tight">Componentes PC</h1>
            <p className="text-slate-400 mt-1">
              {loading ? 'Cargando...' : `${pagination?.total ?? 0} productos encontrados`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border-dark bg-surface-dark text-sm font-medium text-white"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filtros {hasActiveFilters && <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">!</span>}
            </button>

            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1) }}
              className="bg-surface-dark border border-border-dark text-white text-sm rounded-lg p-2.5 pr-8 focus:ring-primary focus:border-primary cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="hidden md:flex bg-surface-dark rounded-lg border border-border-dark p-1 gap-1">
              <button onClick={() => setViewGrid(true)}
                className={`p-1.5 rounded ${viewGrid ? 'bg-background-dark text-primary' : 'text-slate-400 hover:text-white'}`}>
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button onClick={() => setViewGrid(false)}
                className={`p-1.5 rounded ${!viewGrid ? 'bg-background-dark text-primary' : 'text-slate-400 hover:text-white'}`}>
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros móvil */}
        {filterOpen && (
          <div className="lg:hidden bg-surface-dark rounded-xl border border-border-dark p-6">
            <Sidebar />
          </div>
        )}

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                "{search}"
                <button onClick={() => { setSearch(''); setPage(1) }}>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                {categories.find(c => c.slug === category)?.name || category}
                <button onClick={() => { setCategory(''); setPage(1) }}>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}
          </div>
        )}

        {/* Estados: loading / error / vacío / grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-[64px] text-slate-700">search_off</span>
            <p className="text-slate-400 mt-4 text-lg">No se encontraron productos.</p>
            <button onClick={clearFilters} className="mt-4 text-primary font-medium hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewGrid ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center py-8 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-dark border border-border-dark text-slate-400 hover:text-primary hover:border-primary disabled:opacity-40 transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, i, arr) => {
                if (i > 0 && n - arr[i - 1] > 1) acc.push('...')
                acc.push(n)
                return acc
              }, [])
              .map((n, i) => n === '...' ? (
                <span key={`ellipsis-${i}`} className="text-slate-500 px-1">...</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    n === page
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-surface-dark border border-border-dark text-slate-400 hover:text-primary hover:border-primary'
                  }`}
                >
                  {n}
                </button>
              ))
            }

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-dark border border-border-dark text-slate-400 hover:text-primary hover:border-primary disabled:opacity-40 transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
