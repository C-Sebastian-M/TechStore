import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import * as productService from '../services/productService.js'
import { Spinner, ErrorState } from '../hooks/useApi.jsx'
import { FORMAT_CURRENCY } from '../constants'

// ─── Mapeo: slug de categoría → slot del configurador ───────────────────────
const CATEGORY_TO_SLOT = {
  'procesadores':       'cpu',
  'placas-madre':       'motherboard',
  'memorias-ram':       'ram',
  'memoria-ram':        'ram',
  'tarjetas-de-video':  'gpu',
  'almacenamiento':     'storage',
  'fuentes-de-poder':   'psu',
  'gabinetes':          'case',
  'enfriamiento':       'cooling',
  'refrigeracion':      'cooling',
}

// ─── Modal: ¿Seguir comprando o ir al carrito? ──────────────────────────
function AddedToCartModal({ product, qty, onKeepShopping, onGoToCart }) {
  const subtotal = Number(product.price) * qty
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onKeepShopping} />

      {/* Modal */}
      <div className="relative bg-surface-dark border border-border-dark rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Cabecera */}
        <div className="bg-gradient-to-br from-green-500/20 to-primary/10 border-b border-border-dark px-5 py-4 flex items-center gap-4">
          <div className="size-11 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-400 text-[22px]">check_circle</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-black text-base leading-tight">¡Agregado al carrito!</h3>
            <p className="text-slate-400 text-xs mt-0.5 truncate">{qty > 1 ? `${qty}x ` : ''}{product.name}</p>
          </div>
        </div>

        {/* Producto */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="size-16 rounded-xl bg-background-dark border border-border-dark shrink-0 flex items-center justify-center overflow-hidden">
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
              : <span className="material-symbols-outlined text-slate-600 text-[24px]">developer_board</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{product.name}</p>
            <p className="text-slate-500 text-xs">{product.brand}</p>
            <p className="text-primary font-black text-sm mt-0.5">${FORMAT_CURRENCY(subtotal)}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            onClick={onGoToCart}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-white font-black text-sm hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            Ir al carrito y pagar
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
          <button
            onClick={onKeepShopping}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border-dark bg-background-dark/50 text-slate-300 font-bold text-sm hover:border-primary/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ESTRELLAS ────────────────────────────────────────────────────────────────
const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-2">
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`material-symbols-outlined text-[20px] ${i <= Math.floor(Number(rating)) ? 'text-yellow-400' : 'text-gray-600'}`}>
          {i <= Number(rating) ? 'star' : Number(rating) - i > -1 ? 'star_half' : 'star'}
        </span>
      ))}
    </div>
    <span className="text-slate-400 text-sm">{Number(rating).toFixed(1)} ({count} reviews)</span>
  </div>
)

export default function ProductDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { addToCart } = useCart()
  const { user, openLogin } = useAuth()

  // ── Estado del producto ───────────────────────────────────────────────────
  const [product,     setProduct]     = useState(null)
  const [related,     setRelated]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  // ── Estado UI ─────────────────────────────────────────────────────────────
  const [activeImage,    setActiveImage]    = useState(0)
  const [qty,            setQty]            = useState(1)
  const [activeTab,      setActiveTab]      = useState('descripcion')
  const [addedToCart,    setAddedToCart]    = useState(false)
  const [showCartModal,  setShowCartModal]  = useState(false)
  const [favorited,      setFavorited]      = useState(false)

  // ── Cargar producto y relacionados al cambiar el id ───────────────────────
  useEffect(() => {
    setLoading(true)
    setError(null)
    setActiveImage(0)
    setQty(1)
    setActiveTab('descripcion')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    productService.getProductById(id)
      .then(p => {
        setProduct(p)
        // Cargar relacionados de la misma categoría
        return productService.getProducts({
          category: p.category?.slug,
          limit:    5,
        })
      })
      .then(res => {
        setRelated((res.data || []).filter(p => p.id !== id).slice(0, 4))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    setShowCartModal(true)
  }

  const handleViewInConfigurator = () => {
    const slot = CATEGORY_TO_SLOT[product.category?.slug]
    // Pasamos el producto y el slot detectado como estado de navegación
    // El configurador lo leerá y preseleccionara el componente automáticamente
    navigate('/configurador', {
      state: {
        preselect: {
          product: {
            id:    product.id,
            name:  product.name,
            brand: product.brand,
            price: Number(product.price),
            image: product.image,
            specs: product.specs || [],
            badge: product.badge || null,
          },
          slot,
        }
      }
    })
  }

  const handleFavorite = async () => {
    if (!user) { openLogin(); return }
    try {
      const result = await productService.toggleFavorite(id)
      setFavorited(result.favorited)
    } catch { /* silencioso */ }
  }

  // ── Estados de carga / error ──────────────────────────────────────────────
  if (loading) return (
    <div className="flex-grow flex items-center justify-center py-40">
      <Spinner size="lg" />
    </div>
  )

  if (error || !product) return (
    <div className="flex-grow">
      <ErrorState
        message={error || 'Producto no encontrado.'}
        onRetry={() => navigate(-1)}
      />
    </div>
  )

  // ── Normalizar campos Decimal de Prisma ───────────────────────────────────
  const price    = Number(product.price)
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null
  const rating   = Number(product.rating)

  // specs puede ser array de strings (API) o array de objetos {label,value}
  // La API lo guarda como JSON array de strings → los mostramos en tabla simple
  const specsArray = Array.isArray(product.specs) ? product.specs : []

  // Imágenes: la BD solo tiene una imagen principal, la repetimos para el carrusel
  const images = product.image ? [product.image] : []

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">

      {/* Pop-up ¿Seguir comprando o ir al carrito? */}
      {showCartModal && (
        <AddedToCartModal
          product={product}
          qty={qty}
          onKeepShopping={() => setShowCartModal(false)}
          onGoToCart={() => { setShowCartModal(false); navigate('/carrito') }}
        />
      )}
      <main className="flex h-full grow flex-col px-4 md:px-10 lg:px-40 py-5 w-full max-w-[1440px] mx-auto">

        {/* Breadcrumbs */}
        <nav className="flex flex-wrap gap-2 py-4 mb-2">
          <Link to="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Inicio</Link>
          <span className="text-slate-400 text-sm">/</span>
          <Link to="/productos" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Componentes</Link>
          <span className="text-slate-400 text-sm">/</span>
          <span className="text-slate-400 text-sm">{product.category?.name}</span>
          <span className="text-slate-400 text-sm">/</span>
          <span className="text-white text-sm font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-surface-dark">

          {/* Galería */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="aspect-[4/3] w-full bg-surface-dark rounded-xl overflow-hidden relative group">
              <div
                className="absolute inset-0 bg-center bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url("${images[activeImage] || ''}")` }}
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${product.badgeColor || 'bg-primary'}`}>
                    {product.badge}
                  </span>
                </div>
              )}
              {/* Botón favorito */}
              <button
                onClick={handleFavorite}
                className={`absolute top-4 right-4 size-9 rounded-full backdrop-blur flex items-center justify-center transition-colors ${
                  favorited ? 'bg-red-500/20 text-red-400' : 'bg-surface-dark/80 text-slate-400 hover:text-red-400'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{favorited ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-24 h-24 shrink-0 rounded-lg border-2 overflow-hidden bg-surface-dark p-1 transition-colors ${i === activeImage ? 'border-primary' : 'border-transparent hover:border-border-dark'}`}
                  >
                    <div className="w-full h-full bg-center bg-cover bg-no-repeat rounded" style={{ backgroundImage: `url("${img}")` }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary font-bold tracking-wide uppercase text-xs">{product.brand}</span>
                <span className="text-slate-400 text-xs">|</span>
                <span className="text-slate-400 text-xs">{product.category?.name}</span>
              </div>
              <h1 className="text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight mb-4">
                {product.name}
              </h1>
              <StarRating rating={rating} count={product.reviews} />
            </div>

            {/* Precio & Stock */}
            <div className="flex flex-col gap-2 p-6 rounded-xl bg-surface-dark/50 border border-surface-dark">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-white">${FORMAT_CURRENCY(price)}</span>
                {oldPrice && (
                  <>
                    <span className="text-lg text-slate-400 line-through mb-1.5">${FORMAT_CURRENCY(oldPrice)}</span>
                    <span className="mb-2 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded uppercase">Oferta</span>
                  </>
                )}
              </div>

              <div className={`flex items-center gap-2 text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-[18px]">{product.stock > 0 ? 'check_circle' : 'cancel'}</span>
                <span>{product.stock > 0 ? `En Stock (${product.stock} disponibles)` : 'Agotado'}</span>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                  <div className="w-24 relative">
                    <select
                      value={qty}
                      onChange={e => setQty(Number(e.target.value))}
                      className="w-full h-12 bg-background-dark border border-surface-dark text-white rounded-lg px-3 focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                    >
                      {Array.from({ length: Math.min(product.stock, 5) }, (_, i) => i + 1).map(n => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 h-12 font-bold rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(19,127,236,0.3)] disabled:opacity-50 disabled:cursor-not-allowed ${
                      addedToCart ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-blue-600'
                    } text-white`}
                  >
                    <span className="material-symbols-outlined">{addedToCart ? 'check_circle' : 'shopping_cart'}</span>
                    {addedToCart ? '¡Agregado!' : 'Agregar al Carrito'}
                  </button>
                </div>
                <button
                  onClick={handleViewInConfigurator}
                  disabled={!CATEGORY_TO_SLOT[product.category?.slug]}
                  className="w-full h-12 bg-transparent border border-surface-dark hover:border-primary text-slate-400 hover:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
                  title={
                    CATEGORY_TO_SLOT[product.category?.slug]
                      ? `Agregar al configurador como ${CATEGORY_TO_SLOT[product.category?.slug]}`
                      : 'Esta categoría no corresponde a un componente del configurador'
                  }
                >
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors">build</span>
                  Agregar al Configurador
                </button>
              </div>
            </div>

            {/* Quick specs (tags) */}
            {specsArray.length > 0 && (
              <div>
                <h3 className="text-white text-sm font-bold uppercase mb-3 tracking-wider">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {specsArray.map((spec, i) => (
                    <span key={i} className="text-sm text-slate-300 bg-surface-dark/60 border border-surface-dark px-3 py-1.5 rounded-lg">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex gap-1 border-b border-surface-dark">
              {['descripcion', 'especificaciones'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-4 text-sm font-bold capitalize border-b-2 -mb-px transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  {tab === 'descripcion' ? 'Descripción' : 'Especificaciones'}
                </button>
              ))}
            </div>

            {activeTab === 'descripcion' && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">Descripción</h2>
                <p className="text-slate-400 leading-relaxed">{product.description}</p>
              </section>
            )}

            {activeTab === 'especificaciones' && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">Especificaciones</h2>
                {specsArray.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-surface-dark bg-background-dark">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-surface-dark">
                        {specsArray.map((spec, i) => (
                          <tr key={i} className="hover:bg-surface-dark/30 transition-colors">
                            <td className="p-4 font-medium text-slate-400 w-1/3 bg-surface-dark/10">Spec {i + 1}</td>
                            <td className="p-4 text-white">{spec}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500">Sin especificaciones detalladas disponibles.</p>
                )}
              </section>
            )}
          </div>

          {/* Envío */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="rounded-xl bg-surface-dark p-6 flex flex-col gap-4">
              <h3 className="text-white font-bold text-lg">Envío & Garantía</h3>
              {[
                { icon: 'local_shipping', title: 'Envío Gratis',         sub: 'En pedidos mayores a $50'        },
                { icon: 'verified_user', title: 'Garantía 3 años',       sub: 'Garantía oficial del fabricante' },
                { icon: 'replay',        title: '30 días de devolución', sub: 'Sin preguntas'                   },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{item.title}</p>
                    <p className="text-slate-400 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Productos Relacionados</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {related.map(p => {
                const relPrice = Number(p.price)
                return (
                  <Link
                    key={p.id}
                    to={`/producto/${p.id}`}
                    className="snap-start min-w-[260px] w-[260px] bg-surface-dark rounded-xl overflow-hidden border border-surface-dark hover:border-primary/50 transition-all group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-white/5">
                      {p.image
                        ? <div className="w-full h-full bg-center bg-contain bg-no-repeat p-4 transform group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url("${p.image}")` }} />
                        : <div className="w-full h-full flex items-center justify-center text-gray-600"><span className="material-symbols-outlined text-[48px]">developer_board</span></div>
                      }
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <p className="text-xs text-slate-400 font-medium">{p.brand}</p>
                      <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 min-h-[40px]">{p.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-white">${FORMAT_CURRENCY(relPrice)}</span>
                        <button
                          onClick={(e) => { e.preventDefault(); addToCart(p) }}
                          className="bg-surface-dark border border-slate-400/20 hover:bg-primary hover:border-transparent text-white p-2 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
