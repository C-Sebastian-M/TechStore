// ─── Button ───────────────────────────────────────────────────────────────────
// Primitivo de botón con variantes visuales consistentes.
// Uso: <Button>Texto</Button>
//      <Button variant="outline" size="sm" loading>Enviando...</Button>

const BASE = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'

const VARIANTS = {
  primary:  'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-primary/20',
  outline:  'border border-border-dark text-slate-300 hover:border-primary/50 hover:text-white bg-surface-dark',
  ghost:    'text-slate-400 hover:text-white hover:bg-white/5',
  danger:   'border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-red-500/5',
}

const SIZES = {
  sm: 'h-8  px-3 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-8 text-base',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin material-symbols-outlined text-[16px]">
          progress_activity
        </span>
      )}
      {children}
    </button>
  )
}
