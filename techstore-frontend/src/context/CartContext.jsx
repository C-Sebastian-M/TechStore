import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  addItemToCart,
  updateItemQty,
  removeItem,
  calculateTotals,
  applyPromoCode,
} from '../services/cartService'

// ─── TIPOS DE ACCIÓN ──────────────────────────────────────────────────────────
export const CART_ACTIONS = {
  ADD:         'ADD',
  UPDATE_QTY:  'UPDATE_QTY',
  REMOVE:      'REMOVE',
  APPLY_PROMO: 'APPLY_PROMO',
  CLEAR_PROMO: 'CLEAR_PROMO',
  CLEAR_CART:  'CLEAR_CART',
  LOAD_CART:   'LOAD_CART',   // ← nuevo: cargar estado completo desde storage
}

const EMPTY_STATE = { items: [], promoCode: null, promoMeta: null }

// ─── HELPERS DE STORAGE ───────────────────────────────────────────────────────
// Clave única por usuario. Guest no tiene persistencia.
const storageKey  = (userId) => userId ? `cart_${userId}` : null

function saveCart(userId, state) {
  const key = storageKey(userId)
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify({ items: state.items, promoCode: state.promoCode }))
  } catch { /* silencioso */ }
}

function loadCart(userId) {
  const key = storageKey(userId)
  if (!key) return EMPTY_STATE
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return EMPTY_STATE
    const { items, promoCode } = JSON.parse(raw)
    // Reconstruir promoMeta desde el código guardado
    const promoMeta = promoCode ? applyPromoCode(promoCode) : null
    return { items: items || [], promoCode: promoCode || null, promoMeta: promoMeta?.valid ? promoMeta : null }
  } catch {
    return EMPTY_STATE
  }
}

// ─── REDUCER ──────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return action.payload                                         // reemplaza todo el estado
    case CART_ACTIONS.ADD:
      return { ...state, items: addItemToCart(state.items, action.product) }
    case CART_ACTIONS.UPDATE_QTY:
      return { ...state, items: updateItemQty(state.items, action.id, action.qty) }
    case CART_ACTIONS.REMOVE:
      return { ...state, items: removeItem(state.items, action.id) }
    case CART_ACTIONS.APPLY_PROMO: {
      const result = applyPromoCode(action.code)
      if (!result.valid) return state
      return { ...state, promoCode: action.code.trim().toUpperCase(), promoMeta: result }
    }
    case CART_ACTIONS.CLEAR_PROMO:
      return { ...state, promoCode: null, promoMeta: null }
    case CART_ACTIONS.CLEAR_CART:
      return EMPTY_STATE
    default:
      return state
  }
}

// ─── CONTEXTO ─────────────────────────────────────────────────────────────────
const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId   = user?.id ?? null

  const [state, dispatch] = useReducer(cartReducer, EMPTY_STATE)
  const totals = calculateTotals(state.items, state.promoCode)

  // ── Cargar el carrito correcto cuando cambia el usuario ───────────────────
  // Se dispara al montar (userId = null → vacío) y cada vez que userId cambia
  // (login de usuario A → carga cart_A; logout → vacía; login de B → carga cart_B)
  useEffect(() => {
    const saved = loadCart(userId)
    dispatch({ type: CART_ACTIONS.LOAD_CART, payload: saved })
  }, [userId])

  // ── Persistir en localStorage cada vez que el carrito cambia ─────────────
  // Solo si hay un usuario autenticado (guest no persiste)
  useEffect(() => {
    if (userId) saveCart(userId, state)
  }, [userId, state])

  // ── Acciones ──────────────────────────────────────────────────────────────
  const addToCart      = useCallback((product) => dispatch({ type: CART_ACTIONS.ADD,        product }), [])
  const removeFromCart = useCallback((id)       => dispatch({ type: CART_ACTIONS.REMOVE,     id      }), [])
  const updateQty      = useCallback((id, qty)  => dispatch({ type: CART_ACTIONS.UPDATE_QTY, id, qty }), [])
  const applyPromo     = useCallback((code) => {
    dispatch({ type: CART_ACTIONS.APPLY_PROMO, code })
    const result = applyPromoCode(code)
    return result.valid ? result : null
  }, [])
  const clearPromo = useCallback(() => dispatch({ type: CART_ACTIONS.CLEAR_PROMO }), [])
  const clearCart  = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART })
    // Al hacer clearCart (post-compra) también borra el storage de ese usuario
    if (userId) {
      try { localStorage.removeItem(storageKey(userId)) } catch { /* silencioso */ }
    }
  }, [userId])

  return (
    <CartContext.Provider value={{
      cartItems: state.items,
      promoCode: state.promoCode,
      promoMeta: state.promoMeta,
      ...totals,
      addToCart,
      removeFromCart,
      updateQty,
      applyPromo,
      clearPromo,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
