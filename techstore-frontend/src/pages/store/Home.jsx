// ─── Dominio: store/Home ──────────────────────────────────────────────────────
// Página principal de la tienda. Muestra hero, categorías y productos destacados.
import { Link }                    from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import ProductCard                 from '../../components/ui/ProductCard.jsx'
import * as productService         from '../../features/catalog/services/productService.js'

const CATEGORIES = [
  { name: 'Tarjetas de Video', sub: 'NVIDIA & AMD',    slug: 'tarjetas-de-video', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMgFQN_kNC-YSEMuP5DXkyvsdaIbTTYzjrFaXGkBc3ZATNMzARqFDyYdknlJbdOA9KwVNDqKtfZLr4K6ID05XaFQA78HYIVjsABIKg1YyKFyhfgWajrc6gtdiHRvmnjXs2IMc6YvkgNCWeiwv67_hFD92sqXHjA-X1TZ_eB5K-fFrdUKkMaVY1VPLQGMdjgJIbpRros1TGas4fSTQjS6_47E7aY1fP-oKjhHJKbUCPVzVrmaSKeHHdCYUPR8JrA_Ll5mBF-n9SRBI' },
  { name: 'Procesadores',      sub: 'Intel & AMD',     slug: 'procesadores',      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbjoUuYe7Pvj95XTNlZfS2pdRRfY7UVYDJoZ4u8lBZi8juFsoL1oDAuZTjven1nh2vvHBF6V3OqjQHdmGp2-6OOb6ZoUWZdRL1yicmrNdcHxmNJiO3tCujU6zMXzUfp86BByrDhUNfJ3Wes52zNYx616kS3e6vvJLFpaDsYhDx3ynblgpglLnqCMXuWKCaZH9hTayiSmfJTcgap0PovA2MDieDqvd_wBMmBg74tcpvxURG_6Xy865nT8S17qcqq4sugLCEp4pMjRY' },
  { name: 'Placas Madre',      sub: 'Z790, B650, X670',slug: 'placas-madre',      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr9nLtS3NaylNrqxHCCU2Bj9cXq7_jDTYnMaftRF-9_R6BG2s325xiUdNL_qauDMYrsp7MvQ8jRHFM8dDqL1mOAvdim1Z37J6OMbGQhljL7gf5RzFslhHseRXHn21_TQE2DMZPH6625uhD2-mXdgkjpxT9vBG18Tkp0tlK-b5cOvICtVWqt65NlqC-HiO2_W7jnCCc760okea9UJTuQ4SVdVbb7zApt8fYHBaHMrTfynQIxhPnsFmr7Nf9su5VeCMxnLvK2t12j4I' },
  { name: 'Gabinetes',         sub: 'Mid-Tower & Full',slug: 'gabinetes',         image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOFIBxBfcr3WFoBoGgnXKpu5QR5JkzCRRbNjD4evj1oW4Jly6zlLbeZtUPqWSApW3CDUu1-dIRBRVBgp8-anE47qnfaQ_6V65eXL2zzC_JHvJIGC9ZYcvjr9cGks40D6YSz0owimxRmfFAP-KliWHNO6Xdj6icg-0yrWwtADUY4AtalKZ-GrqWcXpKw9s9CeUlJ0tG23iqdcwkAOKIZ9F_-W_bPMYrhIpsARxG5BUpGO8yS4E5A52Adca-srpDJ5VfHthGr2idxvA' },
]

const TABS = [
  { key: 'popular', label: 'Popular',  icon: 'trending_up',   params: { limit: 4, sortBy: 'rating',    sortOrder: 'desc' },                                verTodosUrl: '/productos?sort=rating:desc',                 emptyMsg: 'No hay productos destacados aún.'  },
  { key: 'nuevos',  label: 'Nuevos',   icon: 'new_releases',  params: { limit: 4, sortBy: 'createdAt', sortOrder: 'desc' },                                verTodosUrl: '/productos?sort=createdAt:desc',              emptyMsg: 'No hay productos nuevos aún.'      },
  { key: 'gaming',  label: 'Gaming',   icon: 'sports_esports',params: { limit: 4, sortBy: 'rating',    sortOrder: 'desc', category: 'tarjetas-de-video' }, verTodosUrl: '/productos?category=tarjetas-de-video&sort=rating:desc', emptyMsg: 'No hay productos de gaming aún.' },
]

export default function Home() {
  const [activeTab,  setActiveTab]  = useState('popular')
  const [products,   setProducts]   = useState({})
  const [loadingTab, setLoadingTab] = useState(null)
  const [loadedTabs, setLoadedTabs] = useState([])

  const loadTab = useCallback(async (tabKey) => {
    if (loadedTabs.includes(tabKey)) return
    const tab = TABS.find(t => t.key === tabKey)
    if (!tab) return
    setLoadingTab(tabKey)
    try {
      const res  = await productService.getProducts(tab.params)
      const data = res?.data || res?.products || (Array.isArray(res) ? res : [])
      setProducts(prev => ({ ...prev, [tabKey]: data }))
      setLoadedTabs(prev => [...prev, tabKey])
    } catch {
      setProducts(prev => ({ ...prev, [tabKey]: [] }))
      setLoadedTabs(prev => [...prev, tabKey])
    } finally { setLoadingTab(null) }
  }, [loadedTabs])

  useEffect(() => { loadTab('popular') }, []) // eslint-disable-line

  const activeTabCfg   = TABS.find(t => t.key === activeTab)
  const activeProducts = products[activeTab] ?? []
  const isLoading      = loadingTab === activeTab

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
            <div className="flex-1 flex flex-col items-start gap-6 lg:gap-8 z-10">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                Nuevo Configurador 2.0
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Arma la PC de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">tus sueños</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Usa nuestro configurador avanzado para crear la máquina perfecta con compatibilidad 100% garantizada.
              </p>
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <Link to="/configurador" className="flex h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-bold text-white shadow-xl shadow-primary/20 hover:bg-blue-600 hover:-translate-y-0.5 transition-all">
                  Empezar a Armar <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <Link to="/productos" className="flex h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark px-8 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-border-dark hover:-translate-y-0.5 transition-all">
                  Ver Ofertas
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[20px]">verified</span><span>Garantía Local</span></div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[20px]">local_shipping</span><span>Envíos Gratis &gt; $150</span></div>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] rounded-full -z-10" />
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent z-10" />
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBBRhTCNGBYRNnOzaCkGuACk9FlzbxhQ86isF1-s13hBYhlQeR9BSeg8RT7cUOj7hA5ENsNUwTmXbKS_1GDdnBPB2qK1b4scHj18jXyZduQJZmHmgy-f4zWDW8Uyy_owgInDfnrZrPHhAoO6PjT1qSSlwv_sXHnuAxtn6hB6MZsVC3QWXALdXqbAJ1OjZCkqeQe6-G68TV1wbMnggRY4Wb6ZdyOwONMu_VnPzPB84dChzhxt-9_sp_-koGetHWqFvmeeCPby3zMJd8")' }} />
                <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-3 overflow-x-auto">
                  <div className="flex items-center gap-3 rounded-lg bg-surface-dark/90 backdrop-blur-md p-3 border border-border-dark min-w-max">
                    <div className="size-10 rounded bg-green-500/20 flex items-center justify-center text-green-400"><span className="material-symbols-outlined">speed</span></div>
                    <div><p className="text-xs text-slate-400">Procesador</p><p className="text-sm font-bold text-white">Intel i9 14900K</p></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-surface-dark/90 backdrop-blur-md p-3 border border-border-dark min-w-max">
                    <div className="size-10 rounded bg-primary/20 flex items-center justify-center text-primary"><span className="material-symbols-outlined">blur_on</span></div>
                    <div><p className="text-xs text-slate-400">Gráfica</p><p className="text-sm font-bold text-white">RTX 4090 OC</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 bg-white dark:bg-surface-dark/30 border-y border-slate-100 dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Categorías Principales</h2>
            <Link to="/productos" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-blue-400 transition-colors">Ver todas <span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} to={`/productos?category=${cat.slug}`} className="group relative flex flex-col overflow-hidden rounded-xl bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                <div className="aspect-square w-full bg-white dark:bg-[#151e29] p-6 flex items-center justify-center">
                  <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url("${cat.image}")` }} />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{cat.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ofertas Destacadas</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Precios especiales por tiempo limitado</p>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-surface-dark p-1 rounded-xl border border-slate-200 dark:border-border-dark self-start sm:self-auto">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); loadTab(tab.key) }} disabled={loadingTab === tab.key}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  {loadingTab === tab.key ? <span className="animate-spin material-symbols-outlined text-[14px]">progress_activity</span> : <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[380px]">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-xl bg-surface-dark border border-border-dark aspect-[3/4] animate-pulse" />)
              : activeProducts.length === 0
              ? <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center"><span className="material-symbols-outlined text-[48px] text-slate-700 mb-3">{activeTab === 'gaming' ? 'sports_esports' : 'trending_up'}</span><p className="text-slate-500 text-sm">{activeTabCfg?.emptyMsg}</p></div>
              : activeProducts.map(product => <ProductCard key={product.id} product={product} />)
            }
          </div>
          <div className="mt-10 text-center">
            <Link to={activeTabCfg?.verTodosUrl ?? '/productos'} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark px-8 py-3 text-base font-bold text-slate-900 dark:text-white hover:border-primary hover:text-primary transition-all">
              Ver todos los productos <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-background-dark border-t border-border-dark py-20 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(19,127,236,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(19,127,236,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">Tu PC ideal, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">armada en minutos</span></h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Nuestro configurador verifica la compatibilidad de cada componente en tiempo real.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/configurador" className="flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-[20px]">build</span>Armar mi PC ahora<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link to="/productos" className="flex items-center gap-2 h-12 px-6 rounded-xl border border-border-dark bg-surface-dark text-slate-300 font-bold text-sm hover:border-primary/50 hover:text-white hover:-translate-y-0.5 transition-all">
              <span className="material-symbols-outlined text-[20px]">storefront</span>Ver catálogo
            </Link>
          </div>
          <div className="mt-16 pt-8 border-t border-border-dark grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[{ value: '+500', label: 'Componentes verificados', icon: 'inventory_2' }, { value: '100%', label: 'Compatibilidad garantizada', icon: 'verified' }, { value: '4.9★', label: 'Valoración media', icon: 'star' }, { value: '<24h', label: 'Tiempo de entrega', icon: 'local_shipping' }].map(m => (
              <div key={m.label} className="flex flex-col items-center text-center gap-1">
                <span className="material-symbols-outlined text-primary text-[22px]">{m.icon}</span>
                <span className="text-white font-black text-2xl">{m.value}</span>
                <span className="text-slate-500 text-xs">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
