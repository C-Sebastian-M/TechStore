import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import * as orderService from '../services/orderService.js'

export default function Payment() {
  const { cartItems, subtotal, tax, shipping, total, promoCode, clearCart } = useCart()
  const { isAuthenticated, openLogin, user } = useAuth()
  const navigate  = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [error,   setError]   = useState('')

  const handleConfirm = async () => {
    if (!isAuthenticated) { openLogin(); return }

    setPlacing(true)
    setError('')
    try {
      // Pedido de demo con datos genéricos — sin pasarela de pago real
      const order = await orderService.createOrder({
        items:  cartItems.map(item => ({ productId: item.id, qty: item.qty })),
        shipping: {
          fullName:   user?.name || 'Usuario Demo',
          address:    'Dirección de demostración',
          city:       'Medellín',
          postalCode: '050001',
          country:    'Colombia',
        },
        paymentMethod: 'card',
        promoCode:     promoCode || null,
      })
      clearCart()
      navigate('/confirmacion', {
        state: {
          fromPayment: true,
          order,
          orderItems: order.items.map(i => ({
            id:    i.productId,
            name:  i.product.name,
            brand: i.product.brand,
            image: i.product.image,
            price: Number(i.unitPrice),
            qty:   i.qty,
          })),
          shippingData: {
            name:    user?.name || 'Usuario Demo',
            address: 'Dirección de demostración',
            city:    'Medellín',
            country: 'Colombia',
          },
          subtotal: Number(order.subtotal),
          tax:      Number(order.tax),
          shipping: Number(order.shipping),
          total:    Number(order.total),
        }
      })
    } catch (err) {
      setError(err.message || 'Error al simular el pedido. Intenta de nuevo.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-16 bg-background-dark">
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* Banner educativo */}
        <div className="flex items-start gap-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-5">
          <span className="material-symbols-outlined text-amber-400 text-[28px] shrink-0 mt-0.5">school</span>
          <div>
            <p className="text-amber-400 font-bold text-base">Aplicación educativa</p>
            <p className="text-amber-300/70 text-sm mt-1 leading-relaxed">
              Este es un proyecto académico de demostración. No se procesan pagos reales
              ni se cobran tarjetas. Al confirmar, se simulará el pedido con datos de prueba.
            </p>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-dark">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
              Resumen del pedido
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {cartItems.length} artículo{cartItems.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Items */}
          <div className="px-6 py-4 flex flex-col gap-3 max-h-56 overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-background-dark border border-border-dark shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    : <span className="material-symbols-outlined text-slate-600">developer_board</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-slate-500 text-xs">Cantidad: {item.qty}</p>
                </div>
                <span className="text-primary font-bold text-sm shrink-0">
                  ${(Number(item.price) * item.qty).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="px-6 py-4 border-t border-border-dark bg-background-dark/30 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Envío</span>
              <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>IVA (19%)</span>
              <span>${tax.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border-dark">
              <span className="text-white font-bold">Total</span>
              <span className="text-primary font-black text-lg">
                ${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={cartItems.length === 0 || placing}
            className="w-full h-13 bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {placing ? (
              <><span className="animate-spin material-symbols-outlined">progress_activity</span>Simulando pedido...</>
            ) : (
              <><span className="material-symbols-outlined">check_circle</span>Confirmar pedido (demo)</>
            )}
          </button>

          <Link
            to="/carrito"
            className="w-full h-11 border border-border-dark rounded-xl text-slate-400 font-medium text-sm hover:text-white hover:border-primary/40 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver al carrito
          </Link>
        </div>

      </div>
    </main>
  )
}
