// ─── Badge ────────────────────────────────────────────────────────────────────
// Etiqueta visual reutilizable para estados, categorías y promociones.
// Uso: <Badge>NEW</Badge>
//      <Badge variant="success" size="sm">Entregado</Badge>
//      <Badge className="bg-red-500">-15%</Badge>

const BASE = 'inline-flex items-center gap-1 font-bold rounded-full'

const VARIANTS = {
  default:  'bg-primary/10   text-primary   border border-primary/20',
  success:  'bg-green-500/10 text-green-400 border border-green-500/20',
  warning:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  danger:   'bg-red-500/10   text-red-400   border border-red-500/20',
  purple:   'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  blue:     'bg-blue-500/10  text-blue-400  border border-blue-500/20',
  slate:    'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  solid:    'bg-primary text-white',
}

const SIZES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs    px-2   py-0.5',
  md: 'text-sm    px-3   py-1',
}

export default function Badge({
  children,
  variant   = 'default',
  size      = 'sm',
  icon,
  className = '',
}) {
  return (
    <span className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {icon && <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{icon}</span>}
      {children}
    </span>
  )
}
