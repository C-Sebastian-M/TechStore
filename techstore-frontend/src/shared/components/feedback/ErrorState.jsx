// ─── ErrorState ───────────────────────────────────────────────────────────────
// Componente de feedback para estados de error con opción de reintentar.
// Uso: <ErrorState message="No se pudo cargar" onRetry={refetch} />

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" role="alert">
      <span className="material-symbols-outlined text-[48px] text-red-400">error</span>
      <p className="text-slate-400 text-sm text-center max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Reintentar
        </button>
      )}
    </div>
  )
}
