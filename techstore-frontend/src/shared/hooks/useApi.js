import { useState, useEffect, useCallback } from 'react'

// ─── useApi ───────────────────────────────────────────────────────────────────
// Ejecuta una función async y gestiona los estados loading / error / data.
//
// Uso básico:
//   const { data, loading, error } = useApi(() => productService.getProducts())
//
// Con deps (re-fetch cuando cambia un valor):
//   const { data } = useApi(() => productService.getById(id), [id])
//
// Manual (no ejecutar al montar, llamar con execute()):
//   const { execute, loading } = useApi(fn, [], { immediate: false })

export function useApi(fn, deps = [], { immediate = true } = {}) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error,   setError]   = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute])

  return { data, loading, error, execute, setData }
}
