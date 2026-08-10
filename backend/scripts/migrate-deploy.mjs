// =============================================================================
// Script de bootstrap de migraciones para Supabase Transaction Pooler
// =============================================================================
// Este script reemplaza a `prisma migrate deploy` en entornos donde el
// Transaction Pooler de Supabase provoca que Prisma se cuelgue.
//
// Prisma 7 + PgBouncer en modo transaction es incompatible con las
// prepared statements que usa Prisma internamente para verificar y aplicar
// migraciones, lo que deja el comando colgado indefinidamente.
//
// Como el schema ya se aplico previamente (manualmente con pg) y es
// identico al de las migraciones de Prisma, este script registra cada
// migracion en la tabla `_prisma_migrations` como ya aplicada, evitando
// que el backend intente volver a ejecutarlas.
//
// Es idempotente: detecta migraciones ya registradas y las respeta.
// =============================================================================

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'pg';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!SUPABASE_URL) {
  console.error(
    'ERROR: Define SUPABASE_DATABASE_URL, DIRECT_URL o DATABASE_URL en el entorno.'
  );
  process.exit(1);
}

const MIGRATIONS_DIR = path.resolve(__dirname, '../prisma/migrations');

// Calcula el checksum SHA256 con el mismo formato que usa Prisma internamente.
const calculateChecksum = (sql) => {
  return createHash('sha256').update(sql).digest('hex');
};

const run = async () => {
  const client = new Client({ connectionString: SUPABASE_URL });
  await client.connect();
  console.log('Conectado a Supabase.');

  // 1. Aseguramos que la tabla _prisma_migrations exista.
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);
  console.log('Tabla _prisma_migrations lista.');

  // 2. Listamos las migraciones locales.
  const migrationDirs = readdirSync(MIGRATIONS_DIR)
    .filter((name) => {
      const full = path.join(MIGRATIONS_DIR, name);
      return (
        name !== 'migration_lock.toml' &&
        /^\d+_/.test(name) &&
        existsSync(path.join(full, 'migration.sql'))
      );
    })
    .sort();

  console.log(`Migraciones locales encontradas: ${migrationDirs.length}`);

  // 3. Verificamos cuales ya estan registradas.
  const { rows: existing } = await client.query(
    'SELECT migration_name FROM "_prisma_migrations"'
  );
  const alreadyApplied = new Set(existing.map((r) => r.migration_name));
  console.log(`Migraciones ya registradas: ${alreadyApplied.size}`);

  let registered = 0;
  for (const dir of migrationDirs) {
    if (alreadyApplied.has(dir)) {
      console.log(`  [SKIP] ${dir} (ya registrada)`);
      continue;
    }

    const sqlPath = path.join(MIGRATIONS_DIR, dir, 'migration.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    const checksum = calculateChecksum(sql);
    const migrationId = crypto.randomUUID();

    await client.query(
      `INSERT INTO "_prisma_migrations"
       (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
       VALUES ($1, $2, now(), $3, NULL, now(), 1)`,
      [migrationId, checksum, dir]
    );

    console.log(`  [OK]   ${dir} registrada (checksum ${checksum.slice(0, 12)}...)`);
    registered += 1;
  }

  console.log(`\nResumen: ${registered} migraciones registradas, ${alreadyApplied.size} ya existian.`);

  await client.end();
  console.log('Bootstrap de migraciones completado.');
};

run().catch((error) => {
  console.error('Fallo:', error);
  process.exit(1);
});
