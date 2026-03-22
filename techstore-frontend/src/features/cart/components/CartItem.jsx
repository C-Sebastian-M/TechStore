import { Link } from 'react-router-dom'
import { FORMAT_CURRENCY } from '../../../config/locale.js'
import { CART_MAX_QTY, CART_MIN_QTY } from '../../../config/constants.js'

// ─── CartItem ─────────────────────────────────────────────────────────────────
// Fila de producto dentro del carrito de compras.
// Props:
//   item        — { id, name, brand, image, price, qty }
//   onUpdateQty — (id, newQty) => void  (qty < CART_MIN_QTY elimina el item)
//   onRemove    — (id) => void

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const price    = Number(item.price)
  const subtotal = price * item.qty

  return (
    <div className="group relative flex flex-col md:flex-row gap-4 bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-200 dark:border-transparent hover:border-primary/50 transition-all">

      <div className="flex items-start gap-4 flex-1">
        {/* Imagen */}
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
        <div className="flex flex-col justify-center gap-1">
          <Link
            to={`/producto/${item.id}`}
            className="text-slate-900 dark:text-white text-lg font-bold leading-tight hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {item.brand && `Marca: ${item.brand} · `}
            <span className="text-green-500 font-medium">En stock</span>
          </p>
          <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider bg-slate-100 dark:bg-background-dark self-start px-2 py-0.5 rounded mt-0.5">
            Componente
          </span>
        </div>
      </div>

      {/* Cantidad y Precio */}
      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 mt-2 md:mt-0">

        {/* Stepper */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-background-dark rounded-lg p-1">
          <button
            onClick={() => onUpdateQty(item.id, item.qty - 1)}
            disabled={item.qty <= CART_MIN_QTY}
            className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-surface-dark text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-border-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Disminuir cantidad"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>

          <span className="w-8 text-center text-slate-900 dark:text-white font-bold text-sm tabular-nums">
            {item.qty}
          </span>

          <button
            onClick={() => onUpdateQty(item.id, item.qty + 1)}
            disabled={item.qty >= CART_MAX_QTY}
            className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-surface-dark text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-border-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Aumentar cantidad"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        {/* Precio */}
        <div className="flex flex-col items-end min-w-[80px]">
          <span className="text-slate-900 dark:text-white text-lg font-bold">
            ${FORMAT_CURRENCY(subtotal)}
          </span>
          {item.qty > 1 && (
            <span className="text-slate-400 text-xs">${FORMAT_CURRENCY(price)} c/u</span>
          )}
        </div>

        {/* Eliminar */}
        <button
          aria-label="Eliminar del carrito"
          onClick={() => onRemove(item.id)}
          className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  )
}
