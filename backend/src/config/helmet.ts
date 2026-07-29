// =============================================================================
// Configuración de Helmet para seguridad de encabezados HTTP
// =============================================================================
// Helmet ayuda a proteger la aplicación de vulnerabilidades comunes configurando
// encabezados HTTP de seguridad.
// - Content Security Policy (CSP): Ayuda a prevenir ataques XSS (Cross-Site Scripting)
//
// NOTA SOBRE EL SCOPE DE ESTA CSP:
// El backend responde unicamente JSON (no HTML), por lo que la CSP afecta
// principalmente a quien incruste las respuestas del backend en un documento
// padre (por ejemplo, via <iframe> o fetch + eval). Para el caso normal
// de la SPA, la CSP relevante es la del frontend (inyectada por el plugin
// "sportmetric:csp" en vite.config.js).
// =============================================================================

export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Necesario para el HMR de Vite/React en desarrollo
      // connect-src cubre la API misma y los WebSockets de Vite (HMR) en dev.
      // En produccion esta CSP no se aplica a los consumidores del API porque
      // el navegador solo evalua CSP sobre el documento principal, no sobre
      // las respuestas JSON.
      connectSrc: ["'self'", "http://localhost:3001", "http://127.0.0.1:3001", "ws://localhost:5173", "ws://localhost:5174", "ws://127.0.0.1:5173", "ws://127.0.0.1:5174", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null, // No forzar HTTPS en desarrollo local
    },
  },
};