// =============================================================================
// Configuración de Helmet para seguridad de encabezados HTTP
// =============================================================================
// Helmet ayuda a proteger la aplicación de vulnerabilidades comunes configurando
// encabezados HTTP de seguridad.
// - Content Security Policy (CSP): Ayuda a prevenir ataques XSS (Cross-Site Scripting)
// =============================================================================

export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Necesario para el HMR de Vite/React en desarrollo
      connectSrc: ["'self'", "http://localhost:3001", "http://127.0.0.1:3001", "ws://localhost:5173", "ws://localhost:5174", "ws://127.0.0.1:5173", "ws://127.0.0.1:5174", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"], // Permite conexiones a la API y WebSockets de Vite
      imgSrc: ["'self'", "data:", "https://coresg-normal.trae.ai"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null, // No forzar HTTPS en desarrollo local
    },
  },
};