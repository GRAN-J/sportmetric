import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../src/generated/prisma');
const targetDir = path.resolve(__dirname, '../dist/generated/prisma');

if (!existsSync(sourceDir)) {
  throw new Error(`No se encontró el cliente Prisma generado en ${sourceDir}`);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(path.dirname(targetDir), { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Cliente Prisma copiado a ${targetDir}`);
