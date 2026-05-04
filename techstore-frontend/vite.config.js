import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    // En producción elimina todos los console.* automáticamente
    // El cliente nunca verá logs, errores ni advertencias de depuración
    minify: 'terser',
    terserOptions: {
      compress: {
        // Elimina console.log, console.warn, console.info, console.debug
        drop_console: true,
        // Elimina debugger statements
        drop_debugger: true,
        // Elimina código muerto
        dead_code: true,
        // Elimina console.error también (cambiar a false si quieres conservarlo)
        pure_funcs: ['console.log', 'console.warn', 'console.info', 'console.debug', 'console.error'],
      },
    },
    // Separar vendors en chunks para mejor caché
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          ui:      ['@radix-ui/react-slot'],
        },
      },
    },
    // Advertir si algún chunk supera 500KB
    chunkSizeWarningLimit: 500,
  },

  // En desarrollo conserva los console.* para depuración
  // Solo se eliminan cuando se hace `vite build` (producción)
}))
