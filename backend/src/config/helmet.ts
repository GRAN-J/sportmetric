// =============================================================================
// Configuración de Helmet para seguridad de encabezados HTTP
// =============================================================================
// Helmet ayuda a proteger la aplicación de vulnerabilidades comunes configurando
// encabezados HTTP de seguridad.
// - Content Security Policy (CSP): Ayuda a prevenir ataques XSS (Cross-Site Scripting)
// =============================================================================

export const helmetConfig = {
  // Configuración de Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],                      // Solo recursos del mismo origen por defecto
      styleSrc: ["'self'", "'unsafe-inline'"],    // Permite estilos del mismo origen e inline (para Tailwind/Vite)
      scriptSrc: ["'self'"],                      // Permite scripts solo del mismo origen
      imgSrc: ["'self'", "data:"],                // Permite imágenes del mismo origen y data URIs (para placeholders)
    },
  },
};