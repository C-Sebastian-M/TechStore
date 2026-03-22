// ─── BARREL RE-EXPORT ─────────────────────────────────────────────────────────
// El hook useApi ahora vive en shared/hooks/useApi.js (solo el hook, sin componentes UI).
// Los componentes UI viven en shared/components/feedback/ y shared/components/ui/.
// Este archivo mantiene compatibilidad con todos los imports existentes.

export { useApi } from '../shared/hooks/useApi.js'
export { default as Spinner }    from '../shared/components/ui/Spinner.jsx'
export { default as ErrorState } from '../shared/components/feedback/ErrorState.jsx'
export { default as EmptyState } from '../shared/components/feedback/EmptyState.jsx'
