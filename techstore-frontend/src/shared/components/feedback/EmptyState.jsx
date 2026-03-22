// ─── EmptyState ───────────────────────────────────────────────────────────────
// Componente genérico para cuando una lista está vacía.
// Uso: <EmptyState icon="inbox" title="Sin pedidos" subtitle="Haz tu primera compra" action={<Button>Ver catálogo</Button>} />

export default function EmptyState({ icon = 'inbox', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="material-symbols-outlined text-[56px] text-slate-700">{icon}</span>
      {title    && <p className="text-white font-bold text-lg">{title}</p>}
      {subtitle && <p className="text-slate-500 text-sm text-center max-w-sm">{subtitle}</p>}
      {action}
    </div>
  )
}
