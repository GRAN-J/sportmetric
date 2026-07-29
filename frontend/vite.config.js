import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { cspPlugin } from './vite/csp.js';

// =============================================================================
// Configuración de Vite:
// - Plugin de React (SWC).
// - Plugin CSP para inyectar Content-Security-Policy en el HTML.
//   La cadena CSP se construye en frontend/vite/csp.js a partir de
//   variables de entorno, sin URLs hardcodeadas por proveedor.
// - Alias "@" para importar desde /src sin rutas relativas largas.
// - Headers de seguridad para desarrollo y previsualización.
// - Proxy de /api/* hacia el backend en :3001 durante el dev.
// - Optimización de chunks para reducir el tamano inicial del bundle.
// Referencia: https://vitejs.dev/config/
// =============================================================================

export default defineConfig({
  plugins: [
    cspPlugin(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    strictPort: false,
    // Proxy de API: redirige /api/* al backend en :3001.
    // Esto evita problemas de CORS, cookies third-party, firewalls loopback
    // y extensiones de Chrome que rompen fetch/XHR en localhost.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        ws: false,
      },
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('@remix-run/router')) {
              return 'vendor-router';
            }
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')
            ) {
              return 'vendor-react';
            }
            return 'vendor-utils';
          }
        },
      },
    },
  },
});
