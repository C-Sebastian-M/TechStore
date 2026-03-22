// ─── RUTAS DE LA APLICACIÓN ───────────────────────────────────────────────────
// Fuente única de verdad para todas las URLs.
// Usar siempre ROUTES.X en lugar de strings hardcodeados en los componentes.

export const ROUTES = {
  HOME:          '/',
  PRODUCTS:      '/productos',
  PRODUCT:       (id) => `/producto/${id}`,
  CART:          '/carrito',
  PAYMENT:       '/pago',
  CONFIRMATION:  '/confirmacion',
  CONFIGURATOR:  '/configurador',
  PROFILE:       '/perfil',
  ORDERS:        '/pedidos',
  FAVORITES:     '/favoritos',
  ABOUT:         '/nosotros',
  CONTACT:       '/contacto',
  FAQ:           '/soporte',
  ADMIN:         '/admin',
}
