// =============================================================================
// Copia el proxy reverso de Vercel al directorio de build
// =============================================================================
// El proxy vive en /api/proxy.js (raiz del repo) como source of truth, pero
// Vercel con outputDirectory="frontend/dist" SOLO sube ese directorio. Sin
// esta copia, el rewrite /api/:path* apunta a una funcion que no existe.
//
// Este script se ejecuta despues de `vite build` y copia el archivo a
// frontend/dist/api/proxy.js para que Vercel lo detecte como Edge Function.
//
// Si en algun momento se elimina /api/proxy.js, este script falla con un
// error explicito (en vez de generar un deploy silenciosamente roto).
// =============================================================================

import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Raiz del proyecto (un nivel arriba de frontend/)
const projectRoot = resolve(__dirname, '..', '..');
const source = join(projectRoot, 'api', 'proxy.js');
const distApiDir = join(__dirname, '..', 'dist', 'api');
const target = join(distApiDir, 'proxy.js');

if (!existsSync(source)) {
  console.error(`[copy-proxy] ERROR: no se encontro el source en ${source}`);
  console.error('[copy-proxy] El proxy de Vercel es requerido para que el frontend consuma el backend.');
  process.exit(1);
}

mkdirSync(distApiDir, { recursive: true });
copyFileSync(source, target);

console.log(`[copy-proxy] OK: ${source} -> ${target}`);
