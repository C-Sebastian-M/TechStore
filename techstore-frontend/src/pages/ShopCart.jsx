import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const price    = Number(item.price)
  const subtotal = price * item.qty
  return (
  <div className="group relative flex flex-col md:flex-row gap-4 bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-200 dark:border-transparent hover:border-primary/50 transition-all">
    <div className="flex items-start gap-4 flex-1">
      {/* Image */}
      <div className="shrink-0 bg-white p-2 rounded-lg size-[90px] flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
        {item.image ? (
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${item.image}")` }}
          />
        ) : (
          <span className="material-symbols-outlined text-[48px] text-gray-400">developer_board</span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center h-full gap-1">
        <Link to={`/producto/${item.id}`} className="text-slate-900 dark:text-white text-lg font-bold leading-tight hover:text-primary transition-colors">
          {item.name}
        </Link>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Marca: {item.brand} | Stock: <span className="text-green-500 font-medium">Disponible</span>
        </p>
        <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider bg-slate-100 dark:bg-[#111a22] self-start px-2 py-1 rounded mt-1">
          Componente Individual
        </span>
      </div>
    </div>

    {/* Qty & Price */}
    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 mt-2 md:mt-0">
      {/* Qty Stepper */}
      <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#111a22] rounded-lg p-1">
        <button
          onClick={() => onUpdateQty(item.id, item.qty - 1)}
          className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-[#233648] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#2f455a] transition-colors"
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <span className="w-8 text-center text-slate-900 dark:text-white font-bold">{item.qty}</span>
        <button
          onClick={() => onUpdateQty(item.id, item.qty + 1)}
          className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-[#233648] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#2f455a] transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end min-w-[80px]">
        <span className="text-slate-900 dark:text-white text-lg font-bold">
          ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
        </span>
        {item.qty > 1 && (
          <span className="text-slate-400 text-xs">${price.toFixed(2)} c/u</span>
        )}
      </div>

      {/* Delete */}
      <button
        aria-label="Eliminar producto"
        onClick={() => onRemove(item.id)}
        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  </div>
  )
}

export default function ShopCart() {
  const { cartItems, updateQty, removeFromCart, subtotal, discount, tax, shipping, total, itemCount, promoCode: appliedCode, promoMeta, applyPromo, clearPromo } = useCart()
  const navigate = useNavigate()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const handleApplyPromo = () => {
    const result = applyPromo(promoInput)
    if (!result) { setPromoError('Código no válido'); setTimeout(() => setPromoError(''), 3000) }
    else setPromoInput('')
  }

  return (
    <div className="flex h-full grow flex-col">
      <div className="w-full flex flex-1 justify-center py-5 lg:py-10 px-4 md:px-8 lg:px-20">
        <div className="flex flex-col w-full max-w-[1280px] flex-1">

          {/* Breadcrumbs & Heading */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4 text-sm">
              <span className="text-primary font-bold">Carrito</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400">Envío</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400">Pago</span>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                Tu Carrito de Compras
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {itemCount} artículo{itemCount !== 1 ? 's' : ''} {itemCount > 0 ? 'listos para procesar' : 'en tu carrito'}
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Cart Items */}
            <div className="lg:col-span-8 flex flex-col gap-4">

              {/* Table Header */}
              <div className="hidden md:flex justify-between px-4 pb-2 border-b border-slate-200 dark:border-[#233648] text-sm font-medium text-slate-500 dark:text-slate-400">
                <span className="flex-1">Producto</span>
                <div className="flex gap-16 pr-12">
                  <span>Cantidad</span>
                  <span>Precio</span>
                </div>
              </div>

              {/* Items */}
              {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark">
                  <span className="material-symbols-outlined text-[64px] text-gray-300 dark:text-gray-600">shopping_cart</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Tu carrito está vacío</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Agrega algunos productos para continuar</p>
                  <Link
                    to="/productos"
                    className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Explorar productos
                  </Link>
                </div>
              ) : (
                cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeFromCart}
                  />
                ))
              )}

              {/* Continue Shopping */}
              {cartItems.length > 0 && (
                <div className="mt-2">
                  <Link
                    to="/productos"
                    className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Continuar comprando
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-surface-dark p-6 shadow-lg border border-slate-200 dark:border-transparent">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resumen del Pedido</h3>

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Descuento ({appliedCode})</span>
                      <span className="font-medium">-${discount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Envío estimado</span>
                    {cartItems.length === 0
                      ? <span className="text-slate-500 text-xs italic py-1 px-2">—</span>
                      : shipping === 0
                      ? <span className="text-green-400 font-medium text-xs py-1 px-2 rounded bg-green-500/10">Gratis ✓</span>
                      : <span className="text-white font-medium text-xs py-1 px-2">${shipping.toFixed(2)}</span>
                    }
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Impuestos (IVA 19%)</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${tax.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-[#344d65]" />

                {/* Promo Code */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="promo-code" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Código de Descuento
                  </label>
                  {appliedCode ? (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                      <div>
                        <p className="text-green-400 text-sm font-bold">{appliedCode}</p>
                        <p className="text-slate-400 text-xs">{promoMeta?.label}</p>
                      </div>
                      <button onClick={clearPromo} className="text-slate-500 hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        id="promo-code"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        className={`w-full rounded-lg bg-slate-100 dark:bg-[#111a22] px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 border focus:ring-0 outline-none text-sm transition-all ${promoError ? 'border-red-500' : 'border-transparent focus:border-primary'}`}
                        placeholder="Ej: TECHSTORE10"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="rounded-lg px-4 py-2 text-sm font-bold bg-slate-200 dark:bg-[#344d65] text-slate-900 dark:text-white hover:bg-primary hover:text-white transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-red-400 text-xs">{promoError}</p>}
                </div>

                <div className="h-px bg-slate-200 dark:bg-[#344d65]" />

                {/* Total */}
                <div className="flex justify-between items-end">
                  <span className="text-lg font-medium text-slate-500 dark:text-slate-400">Total</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    ${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/pago')}
                  disabled={cartItems.length === 0}
                  className="w-full rounded-lg bg-primary py-4 text-center text-base font-bold text-white shadow-lg shadow-primary/20 hover:bg-blue-600 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Simular Pedido (demo)
                </button>

                <div className="flex justify-center gap-4 mt-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="h-6 w-10 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIMSgUcXwEKzOALJblsn0wOJ5NAdKdQwaiRbxP_0TFbSvhVPsXpS7Fm4X9SOW525a-vybQC5S1SdAaUQtzM9S-2tb6mSbjBvVEoSu0KZn_rBNR92uJL85iYRyUhUGsY2tQaqy7otAndOdxzzrxzVqTZnALJQGX6qVEQrtDuINP7SrbQaiYLHEv70OiuXMCnIkc45PwatWo05BMiMWg9aZ2ofwr2LQGePum2bLYYCJ3jU8tE6yWOsD6ZBwiaqkirx6zrvXUipGnEuk")' }} />
                  <div className="h-6 w-10 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBb9qEWXwfIV-Twln6LoEjxJ48tPjJHVvxCO8NRamMwVVkV6lsZCCgUL6iO-oYm4Jbq9eJcuQdL1XnGKBBB2lPrTi1FiwKsifR7mgWtif_7u-2KGGbVNZ19XCbSFKo04QacUXRDnMl7SeMY85Zs74edNLY34PRUMC0ZKbnqGMrxPnZ3J72n-OtlgThnAIoXD5_xetkUK4MqcizrS1ZmZxps1AomiMqR8Ns5FON4BtEjN0gGBfsnSVWqBMa4hPcbSUcdIu4xw_kFNlw")' }} />
                  <div className="h-6 w-10 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAKB0RQjI_BH9lQXe3_wt0Acewgwj6CGAB2Id-PxJwmuXzM2ATEvaQWKPZlJTZHWXlbXNliUBLXhCN3bBystl27mlXhsJo1lOJN9Po_c8kX3s2cBIfP83-MX5yF_sPXP40DNygGejn6-EvD_CGvcD31HyFBAuLhht2DF5bY4fvGtHCS0vsv9DU6EosQBxrPbbjw65mIhhYf3ZqD4Tg8b-AJEK9SdSlZ2gy1Lkh-Na8fKeRJ7_VQ7a0KwzdOFVC_Rggz1zmf3-Is2D8")' }} />
                </div>
              </div>

              {/* Free Shipping Badge */}
              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Envío Gratis en pedidos &gt; $150</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cartItems.length > 0 && shipping > 0
                        ? `Te faltan ${(150 - subtotal).toFixed(2)} USD para envío gratis`
                        : 'Colombia · Envío estándar $24.99 USD'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
