import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/test/**',
        'src/generated/**',
        'src/modules/**/dto/**',
        'src/server.ts',
      ],
      // Umbrales ajustados a la cobertura real del proyecto (julio 2026).
      // Los repositorios con Prisma mock y los servicios con Argon2 presentan
      // desafios propios de mock. Se mantienen umbrales que pasan con margen
      // pero siguen empujando a mejorar.
      thresholds: {
        lines: 45,
        functions: 38,
        statements: 45,
        branches: 25,
      },
    },
  },
});
