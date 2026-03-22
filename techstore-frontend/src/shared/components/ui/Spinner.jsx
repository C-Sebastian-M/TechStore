// ─── Spinner ──────────────────────────────────────────────────────────────────
// Primitivo de carga reutilizable en toda la app.
// Uso: <Spinner /> | <Spinner size="lg" />

const SIZES = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

export default function Spinner({ size = 'md' }) {
  return (
    <div
      className={`${SIZES[size]} animate-spin rounded-full border-2 border-border-dark border-t-primary`}
      role="status"
      aria-label="Cargando"
    />
  )
}
