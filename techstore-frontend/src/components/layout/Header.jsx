import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useRef, useEffect, useCallback } from 'react'
import * as productService from '../../services/productService.js'

// Bug 3 & 14 — La búsqueda ya no usa datos estáticos (products.js / configurator.js).
// Consulta la API para el catálogo y usa la URL real del producto (CUID).
// Los componentes del configurador siguen siendo locales pero navegan al configurador,
// no a una URL de producto con ID falso.

// El índice del configurador ya no es estático.
// La búsqueda usa directamente la API — todos los productos del configurador
// son productos normales con categoría y aparecen en los resultados del catálogo.
const CONFIGURATOR_INDEX = []

function Highlight({ text, query }) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-primary rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  )
}

function SearchBox({ onClose, autoFocus = false, mobile = false }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [focused, setFocused]   = useState(false)
  const [selected, setSelected] = useState(-1)
  const [searching, setSearching] = useState(false)
  const inputRef  = useRef(null)
  const boxRef    = useRef(null)
  const navigate  = useNavigate()

  // Bug 3 & 14 — Búsqueda dinámica desde la API
  const debounceRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setFocused(false)
        setSelected(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  const runSearch = useCallback((value) => {
    const q = value.trim().toLowerCase()
    if (q.length < 2) { setResults([]); setSelected(-1); setSearching(false); return }

    // Buscar en configurador de forma inmediata (local)
    const configuratorHits = CONFIGURATOR_INDEX.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 5)

    // Buscar en la API con debounce
    clearTimeout(debounceRef.current)
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productService.getProducts({ search: q, limit: 6 })
        // El backend devuelve { data: [...], pagination: {...} }
        const apiProducts = (data?.data || data?.products || (Array.isArray(data) ? data : [])).map(p => ({
          id:         `product-${p.id}`,
          name:       p.name,
          brand:      p.brand,
          category:   p.category?.name || p.category || '',
          price:      Number(p.price),
          image:      p.image,
          badge:      p.badge || null,
          badgeColor: p.badgeColor || null,
          type:       'catalog',
          href:       `/producto/${p.id}`,   // ID real CUID del backend
        }))
        setResults([...apiProducts, ...configuratorHits])
      } catch {
        // Si la API falla, mostrar al menos los resultados del configurador
        setResults(configuratorHits)
      } finally {
        setSearching(false)
        setSelected(-1)
      }
    }, 300)
  }, [])

  const handleChange = (e) => {
    setQuery(e.target.value)
    runSearch(e.target.value)
  }

  const handleSelect = (item) => {
    setQuery('')
    setResults([])
    setFocused(false)
    if (onClose) onClose()
    navigate(item.href)
  }

  const handleKeyDown = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selected >= 0) handleSelect(results[selected])
      else if (results.length > 0) handleSelect(results[0])
    } else if (e.key === 'Escape') {
      setFocused(false)
      setResults([])
      if (onClose) onClose()
    }
  }

  const showDropdown = focused && query.length >= 2

  const catalogHits      = results.filter(r => r.type === 'catalog')
  const configuratorHits = results.filter(r => r.type === 'configurator')

  return (
    <div ref={boxRef} className={`relative ${mobile ? 'w-full' : 'w-full'}`}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          {searching
            ? <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
            : <span className="material-symbols-outlined text-[20px]">search</span>
          }
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar componentes, GPUs, CPUs..."
          className="block w-full rounded-xl border border-transparent bg-slate-100 dark:bg-surface-dark py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-primary focus:ring-0 focus:outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark border border-border-dark rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[100] max-h-[420px] overflow-y-auto">

          {results.length === 0 && !searching ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
              <span className="material-symbols-outlined text-[32px] text-slate-600">search_off</span>
              <p className="text-slate-400 text-sm font-bold">Sin resultados para "{query}"</p>
              <p className="text-slate-600 text-xs">Intenta con otro término o navega al catálogo.</p>
            </div>
          ) : results.length === 0 && searching ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
              <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
              Buscando...
            </div>
          ) : (
            <>
              {catalogHits.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-border-dark bg-background-dark/50">
                    <span className="material-symbols-outlined text-[14px] text-primary">storefront</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Catálogo</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{catalogHits.length} resultado{catalogHits.length !== 1 ? 's' : ''}</span>
                  </div>
                  {catalogHits.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selected === i ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="size-10 rounded-lg bg-background-dark border border-border-dark shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">
                          <Highlight text={item.name} query={query} />
                        </p>
                        <p className="text-slate-500 text-xs">
                          <Highlight text={item.brand} query={query} /> · {item.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-primary font-black text-sm">${item.price.toLocaleString('es-CO')}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-black text-white px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {configuratorHits.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 border-y border-border-dark bg-background-dark/50">
                    <span className="material-symbols-outlined text-[14px] text-primary">build</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Configurador PC</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{configuratorHits.length} componente{configuratorHits.length !== 1 ? 's' : ''}</span>
                  </div>
                  {configuratorHits.map((item, i) => {
                    const globalIdx = catalogHits.length + i
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selected === globalIdx ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                      >
                        <div className="size-10 rounded-lg bg-background-dark border border-border-dark shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold truncate">
                            <Highlight text={item.name} query={query} />
                          </p>
                          <p className="text-slate-500 text-xs">
                            <Highlight text={item.brand} query={query} /> · {item.category}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-primary font-black text-sm">${item.price.toLocaleString('es-CO')}</span>
                          <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">build</span>
                            Ver en configurador
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="px-4 py-2.5 border-t border-border-dark bg-background-dark/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-700">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">↑↓</kbd>
                  <span>navegar</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">↵</kbd>
                  <span>seleccionar</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">Esc</kbd>
                  <span>cerrar</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { itemCount } = useCart()
  const { user, openLogin, openRegister, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-border-dark bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined">memory</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TechStore</h1>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBox />
        </div>

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/productos" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Componentes</Link>
            <Link to="/nosotros"  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Nosotros</Link>
            <Link to="/soporte"   className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Soporte</Link>
          </nav>
          <div className="h-6 w-px bg-slate-200 dark:bg-border-dark hidden lg:block" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMobileSearch(true); setMenuOpen(false) }}
              className="md:hidden flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            <Link to="/configurador" className="hidden sm:flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-blue-600 transition-all active:scale-95">
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span className="hidden lg:inline">Configurador PC</span>
              <span className="lg:hidden">Config</span>
            </Link>

            <button
              onClick={() => navigate('/carrito')}
              className="group relative flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex size-9 items-center justify-center rounded-lg border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors font-black text-sm"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-surface-dark border border-border-dark rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border-dark">
                      <p className="text-white font-bold text-sm truncate">{user.name}</p>
                      <p className="text-slate-400 text-xs truncate">{user.email}</p>
                    </div>
                    {[
                      ...(user.role === 'ADMIN' ? [{ icon: 'admin_panel_settings', label: 'Panel Admin', to: '/admin' }] : []),
                      { icon: 'person',      label: 'Mi Perfil',       to: '/perfil'    },
                      { icon: 'inventory_2', label: 'Mis Pedidos',     to: '/pedidos'   },
                      { icon: 'favorite',    label: 'Lista de deseos', to: '/favoritos' },
                    ].map(item => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-primary/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-border-dark mt-1">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false) }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
              </button>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {mobileSearch && (
        <div className="md:hidden border-t border-border-dark bg-background-dark px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <SearchBox mobile autoFocus onClose={() => setMobileSearch(false)} />
          </div>
          <button
            onClick={() => setMobileSearch(false)}
            className="shrink-0 flex size-9 items-center justify-center rounded-lg border border-border-dark text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark px-4 py-4 flex flex-col gap-2">
          <Link to="/productos" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
            <span className="material-symbols-outlined text-[18px]">memory</span>Componentes
          </Link>
          <Link to="/nosotros"  onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
            <span className="material-symbols-outlined text-[18px]">info</span>Nosotros
          </Link>
          <Link to="/soporte"   onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
            <span className="material-symbols-outlined text-[18px]">help</span>Soporte
          </Link>
          <Link to="/contacto"  onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
            <span className="material-symbols-outlined text-[18px]">email</span>Contacto
          </Link>
          <Link to="/configurador" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-primary">
            <span className="material-symbols-outlined text-[18px]">build</span>Configurador PC
          </Link>
          {!user && (
            <div className="flex gap-2 pt-2 border-t border-border-dark mt-1">
              <button onClick={() => { openLogin(); setMenuOpen(false) }} className="flex-1 h-9 border border-border-dark rounded-lg text-sm font-bold text-white hover:border-primary transition-colors">
                Iniciar Sesión
              </button>
              <button onClick={() => { openRegister(); setMenuOpen(false) }} className="flex-1 h-9 bg-primary rounded-lg text-sm font-bold text-white hover:bg-blue-600 transition-colors">
                Registrarse
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
