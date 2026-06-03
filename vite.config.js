import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Configuración de Vite:
// - Plugin de React (SWC).
// - Alias "@" para importar desde /src sin rutas relativas largas.
// Referencia: https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
