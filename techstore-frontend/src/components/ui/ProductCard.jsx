import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import * as productService from '../../services/productService.js'

export default function ProductCard({ product, initialFavorited = false }) {
  const { addToCart } = useCart()
  const { user, openLogin } = useAuth()

  // Bug 11 — inicializar con initialFavorited en lugar de siempre false
  const [favorited, setFavorited] = useState(initialFavorited)

  // Si el prop cambia externamente (ej: página de favoritos), sincronizar
  useEffect(() => {
    setFavorited(initialFavorited)
  }, [initialFavorited])

  const {
    id, name, brand, image,
    badge, badgeColor = 'bg-red-500',
    rating, reviews, outOfStock,
  } = product

  const price    = Number(product.price)
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null

  const categoryName = product.category?.name ?? product.category ?? null

  const handleFavorite = async (e) => {
    e.preventDefault()
    if (!user) { openLogin(); return }
    // Optimistic update
    setFavorited(prev => !prev)
    try {
      const result = await productService.toggleFavorite(id)
      setFavorited(result.favorited)
    } catch {
      // Revertir en caso de error
      setFavorited(prev => !prev)
    }
  }

  return (
    <div className="group flex flex-col rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[1.1] p-6 bg-slate-50 dark:bg-[#151e29] flex items-center justify-center">
        {badge && (
          <span className={`absolute top-3 left-3 ${badgeColor} text-white text-xs font-bold px-2 py-1 rounded z-10`}>
            {badge}
          </span>
        )}
        {image ? (
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: `url("${image}")` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-[64px] opacity-40">developer_board</span>
          </div>
        )}

        {!outOfStock && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Link
              to={`/producto/${id}`}
              className="size-9 rounded-full bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              title="Ver detalles"
            >
              <span className="material-symbols-outlined text-[20px]">visibility</span>
            </Link>
            <button
              onClick={handleFavorite}
              className={`size-9 rounded-full bg-white dark:bg-background-dark shadow-lg flex items-center justify-center transition-colors ${
                favorited
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'text-slate-900 dark:text-white hover:bg-red-500 hover:text-white'
              }`}
              title={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {favorited ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-yellow-400 text-[16px]">star</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {rating} ({reviews})
            </span>
          </div>
        )}
        {brand && (
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{brand}</p>
        )}
        <Link to={`/producto/${id}`}>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        {categoryName && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{categoryName}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-xs text-slate-400 line-through">${oldPrice.toFixed(2)}</span>
            )}
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ${price.toFixed(2)}
            </span>
          </div>

          {outOfStock ? (
            <button disabled className="rounded-lg bg-gray-200 dark:bg-background-dark text-gray-400 p-2 cursor-not-allowed">
              <span className="material-symbols-outlined text-[20px] block">block</span>
            </button>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white p-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] block">add_shopping_cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
