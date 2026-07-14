// Variables mínimas para que la configuración del backend pueda inicializarse
// durante la ejecución de pruebas automatizadas.
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.BACKEND_PUBLIC_URL = 'http://localhost:3001';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:1234@localhost:5432/sportmetric?schema=public';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? '12345678901234567890123456789012';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'abcdefghijklmnopqrstuvwxyz123456';
