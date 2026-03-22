import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { useApi, Spinner, ErrorState } from '../hooks/useApi.jsx'
import * as productService from '../services/productService.js'
import { FORMAT_CURRENCY } from '../constants'
import { useState } from 'react'

export default function Favorites() {
  const { user, openLogin } = useAuth()
  const { addToCart } = useCart()
  const [addedIds, setAddedIds] = useState([])

  // Cargar favoritos reales de la API
  const {
    data: favorites,
    loading,
    error,
    execute: refetch,
    setData: setFavorites,
  } = useApi(
    () => productService.getFavorites(),
    [user?.id],
    { immediate: !!user }
  )

  const handleToggleFavorite = async (productId) => {
    try {
      await productService.toggleFavorite(productId)
      // Quitar de la lista local inmediatamente (optimistic update)
      setFavorites(prev => prev?.filter(p => p.id !== productId) ?? [])
    } catch (err) {
      console.error('Error al quitar favorito:', err)
    }
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    setAddedIds(prev => [...prev, product.id])
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2000)
  }

  const handleAddAll = () => {
    favorites?.forEach(p => addToCart(p))
  }

  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-background-dark px-4 py-24 text-center">
        <span className="material-symbols-outlined text-[56px] text-slate-700 mb-4">favorite</span>
        <h2 className="text-white font-black text-2xl mb-2">Acceso restringido</h2>
        <p className="text-slate-500 mb-6">Debes iniciar sesión para ver tus favoritos.</p>
        <button
          onClick={openLogin}
          className="h-10 px-6 bg-primary rounded-lg text-white font-bold text-sm hover:bg-blue-600 transition-colors"
        >
          Iniciar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex-grow bg-background-dark min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Cabecera */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">favorite</span>
              Mis Favoritos
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {loading ? 'Cargando...' : `${favorites?.length ?? 0} producto${favorites?.length !== 1 ? 's' : ''} guardados`}
            </p>
          </div>
          {favorites && favorites.length > 0 && (
            <button
              onClick={handleAddAll}
              className="flex items-center gap-2 h-10 px-5 bg-primary rounded-lg text-white font-bold text-sm hover:bg-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Agregar todo al carrito
            </button>
          )}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !favorites || favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[72px] text-slate-700 mb-4">heart_broken</span>
            <h3 className="text-white font-black text-xl mb-2">No tienes favoritos aún</h3>
            <p className="text-slate-500 mb-6">Explora el catálogo y guarda los productos que te interesen.</p>
            <Link
              to="/productos"
              className="h-10 px-6 bg-primary rounded-lg text-white font-bold text-sm hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favorites.map(product => {
              const added = addedIds.includes(product.id)
              return (
                <div
                  key={product.id}
                  className="group bg-surface-dark rounded-2xl border border-border-dark overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col"
                >
                  {/* Imagen */}
                  <div className="relative aspect-square bg-background-dark flex items-center justify-center p-6">
                    {product.badge && (
                      <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2 py-0.5 rounded z-10 ${product.badgeColor || 'bg-primary'}`}>
                        {product.badge}
                      </span>
                    )}
                    {product.image
                      ? <div
                          className="w-full h-full bg-contain bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundImage: `url("${product.image}")` }}
                        />
                      : <span className="material-symbols-outlined text-[64px] text-slate-700">developer_board</span>
                    }
                    {/* Botón quitar favorito */}
                    <button
                      onClick={() => handleToggleFavorite(product.id)}
                      className="absolute top-3 right-3 size-8 rounded-full bg-surface-dark/80 backdrop-blur flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Quitar de favoritos"
                    >
                      <span className="material-symbols-outlined text-[18px]">heart_minus</span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{product.brand}</p>
                    <Link to={`/producto/${product.id}`}>
                      <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-yellow-400 text-[14px]">star</span>
                        <span className="text-slate-400 text-xs">{product.rating} ({product.reviews})</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div>
                        {product.oldPrice && (
                          <p className="text-slate-500 text-xs line-through">${FORMAT_CURRENCY(Number(product.oldPrice))}</p>
                        )}
                        <p className="text-white font-black text-lg">${FORMAT_CURRENCY(Number(product.price))}</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold transition-all ${
                          added
                            ? 'bg-green-500 text-white'
                            : 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {added ? 'check_circle' : 'add_shopping_cart'}
                        </span>
                        {added ? '¡Agregado!' : 'Al carrito'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Banner inferior */}
        {favorites && favorites.length > 0 && (
          <div className="mt-10 p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">build</span>
              <div>
                <p className="text-white font-bold">¿Quieres armar tu PC ideal?</p>
                <p className="text-slate-400 text-sm">Usa el configurador para verificar compatibilidad entre componentes.</p>
              </div>
            </div>
            <Link
              to="/configurador"
              className="shrink-0 h-10 px-5 bg-primary rounded-lg text-white font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              Ir al configurador
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
