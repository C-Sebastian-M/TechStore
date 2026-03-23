import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import * as orderService from '../services/orderService.js'

const FormField = ({ label, children }) => (
  <label className="flex flex-col gap-2">
    <span className="text-slate-400 text-sm font-medium">{label}</span>
    {children}
  </label>
)

const inputClass = "w-full rounded-lg bg-surface-dark border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors border"

export default function Payment() {
  const { cartItems, subtotal, tax, shipping, total, promoCode, clearCart } = useCart()
  const { isAuthenticated, openLogin } = useAuth()
  const navigate = useNavigate()
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Colombia',
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  const handleChange = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))

  const handlePay = async () => {
    if (!isAuthenticated) { openLogin(); return }

    // Validar campos obligatorios antes de enviar
    const { firstName, lastName, address, city } = formData
    if (!firstName.trim() || !lastName.trim()) {
      setPayError('Ingresa tu nombre completo para el envío.')
      return
    }
    if (!address.trim()) {
      setPayError('Ingresa la dirección de envío.')
      return
    }
    if (!city.trim()) {
      setPayError('Ingresa la ciudad de envío.')
      return
    }
    if (paymentMethod === 'card') {
      const { cardHolder, cardNumber, expiry, cvv } = formData
      if (!cardHolder.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
        setPayError('Completa todos los campos de la tarjeta.')
        return
      }
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setPayError('Número de tarjeta inválido.')
        return
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        setPayError('Fecha de expiración inválida. Usa el formato MM/AA.')
        return
      }
      if (cvv.length < 3) {
        setPayError('CVV inválido.')
        return
      }
    }

    setPaying(true)
    setPayError('')
    try {
      const order = await orderService.createOrder({
        items: cartItems.map(item => ({ productId: item.id, qty: item.qty })),
        shipping: {
          fullName:   `${formData.firstName} ${formData.lastName}`,
          address:    formData.address,
          city:       formData.city,
          postalCode: formData.postalCode || null,
          country:    formData.country,
        },
        paymentMethod,
        promoCode: promoCode || null,
      })
      clearCart()
      navigate('/confirmacion', {
        state: {
          fromPayment: true,
          order,
          orderItems:  order.items.map(i => ({
            id:    i.productId,
            name:  i.product.name,
            brand: i.product.brand,
            image: i.product.image,
            price: Number(i.unitPrice),
            qty:   i.qty,
          })),
          shippingData: {
            name:       `${formData.firstName} ${formData.lastName}`,
            address:    formData.address,
            city:       formData.city,
            postalCode: formData.postalCode,
            country:    formData.country,
          },
          subtotal: Number(order.subtotal),
          tax:      Number(order.tax),
          shipping: Number(order.shipping),
          total:    Number(order.total),
        }
      })
    } catch (err) {
      setPayError(err.message || 'Error al procesar el pago. Intenta nuevamente.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">

      {/* Breadcrumbs */}
      <nav className="mb-8 flex flex-wrap gap-2 text-sm">
        <Link to="/carrito" className="text-slate-400 hover:text-white transition-colors font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
          Carrito
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-400 font-medium">Envío</span>
        <span className="text-slate-400">/</span>
        <span className="text-primary font-bold">Pago</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-400 font-medium">Confirmación</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* LEFT: Forms */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Shipping Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">1</span>
                Detalles de Envío
              </h2>
              <button className="text-primary text-sm font-bold hover:underline">Editar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Nombre">
                <input className={inputClass} type="text" value={formData.firstName} onChange={handleChange('firstName')} placeholder="John" />
              </FormField>
              <FormField label="Apellidos">
                <input className={inputClass} type="text" value={formData.lastName} onChange={handleChange('lastName')} placeholder="Doe" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <FormField label="Dirección">
                <input className={inputClass} type="text" value={formData.address} onChange={handleChange('address')} placeholder="Calle 123..." />
              </FormField>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField label="Ciudad">
                <input className={inputClass} type="text" value={formData.city} onChange={handleChange('city')} placeholder="Ciudad" />
              </FormField>
              <FormField label="Código Postal">
                <input className={inputClass} type="text" value={formData.postalCode} onChange={handleChange('postalCode')} placeholder="00000" />
              </FormField>
              <FormField label="País">
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={formData.country}
                    onChange={handleChange('country')}
                  >
                    <option value="Colombia">Colombia</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </FormField>
            </div>
          </section>

          <hr className="border-border-dark/50" />

          {/* Payment Section */}
          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">2</span>
              Método de Pago
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { id: 'card', icon: 'credit_card', label: 'Tarjeta de Crédito', sub: 'Visa, Mastercard, Amex' },
                { id: 'paypal', icon: 'account_balance_wallet', label: 'PayPal', sub: 'Pago rápido y seguro' },
              ].map(method => (
                <label key={method.id} className="cursor-pointer relative" aria-label={method.label}>
                  <input
                    type="radio"
                    name="payment_method"
                    className="peer sr-only"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border-dark bg-surface-dark peer-checked:border-primary peer-checked:bg-primary/5 hover:border-slate-400 transition-all">
                    <span className="material-symbols-outlined text-3xl mb-2 text-white">{method.icon}</span>
                    <span className="font-bold text-white">{method.label}</span>
                    <span className="text-xs text-slate-400 mt-1">{method.sub}</span>
                  </div>
                  <div className="absolute top-4 right-4 text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                </label>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="bg-surface-dark/50 p-6 rounded-xl border border-border-dark">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Información de la Tarjeta</h3>
                  <div className="flex gap-2 opacity-70">
                    <div className="w-8 h-5 bg-white rounded-sm" />
                    <div className="w-8 h-5 bg-white/80 rounded-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Titular de la Tarjeta">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                      <input
                        className="w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-4 transition-colors"
                        placeholder="Como aparece en la tarjeta"
                        type="text"
                        value={formData.cardHolder}
                        onChange={handleChange('cardHolder')}
                      />
                    </div>
                  </FormField>
                  <FormField label="Número de Tarjeta">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">credit_card</span>
                      <input
                        className="w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-4 transition-colors"
                        placeholder="0000 0000 0000 0000"
                        type="text"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={handleChange('cardNumber')}
                      />
                    </div>
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Fecha de Expiración">
                      <input
                        className="w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors"
                        placeholder="MM/YY"
                        type="text"
                        value={formData.expiry}
                        onChange={handleChange('expiry')}
                      />
                    </FormField>
                    <FormField label="CVC / CVV">
                      <input
                        className="w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors"
                        placeholder="123"
                        type="text"
                        maxLength={4}
                        value={formData.cvv}
                        onChange={handleChange('cvv')}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="bg-surface-dark/50 p-6 rounded-xl border border-border-dark text-center">
                <span className="material-symbols-outlined text-[48px] text-primary mb-3 block">account_balance_wallet</span>
                <p className="text-slate-400">Serás redirigido a PayPal para completar tu pago de forma segura.</p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-xl shadow-black/20">
              <div className="p-5 border-b border-border-dark">
                <h3 className="text-lg font-bold text-white">Resumen del Pedido</h3>
                <p className="text-slate-400 text-sm mt-1">{cartItems.length} artículo{cartItems.length !== 1 ? 's' : ''} en tu carrito</p>
              </div>

              <div className="max-h-[320px] overflow-y-auto p-5 flex flex-col gap-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-background-dark border border-border-dark flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <span className="material-symbols-outlined text-gray-500 text-[32px]">developer_board</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium text-white line-clamp-2">{item.name}</span>
                      <span className="text-xs text-slate-400 mt-1">Cantidad: {item.qty}</span>
                      <span className="text-sm font-bold text-primary mt-1">
                        ${(Number(item.price) * item.qty).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">
                    No hay productos en el carrito.{' '}
                    <Link to="/productos" className="text-primary hover:underline">Ver productos</Link>
                  </p>
                )}
              </div>

              {/* Bug 9 corregido — usar `shipping` del contexto, no una variable local.
                  El `total` del contexto ya incluye shipping, así que mostramos total directamente. */}
              <div className="p-5 bg-background-dark/30 border-t border-border-dark space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white font-medium">${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Envío</span>
                  <span className="text-white font-medium">
                    {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Impuestos (IVA 19%)</span>
                  <span className="text-white font-medium">${tax.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-border-dark flex justify-between items-end">
                  <span className="text-base font-bold text-white">Total a Pagar</span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {payError && (
                  <div className="mb-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                    {payError}
                  </div>
                )}
                <button
                  onClick={handlePay}
                  disabled={cartItems.length === 0 || paying}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <>
                      <span className="animate-spin material-symbols-outlined">progress_activity</span>
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined group-hover:animate-pulse">lock</span>
                      Pagar Ahora ${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Transacción encriptada SSL 256-bit</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 w-10 bg-white rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
