// =============================================================================
// Servicio de Correo Electrónico (Placeholder)
// =============================================================================
// Este servicio está preparado para integrarse con un proveedor real (SendGrid, 
// Mailgun, Nodemailer, etc.). Por ahora, simula el envío logueando en consola.
// =============================================================================

import logger from '../../modules/shared/utils/logger';
import { env } from '../../config/env';

/**
 * Interfaz para el envío de correos
 */
interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Envía un correo electrónico.
 * TODO: Implementar integración real con Nodemailer o servicio cloud.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  // Simulación de envío
  logger.info(`[EMAIL SIMULATOR] Enviando correo a: ${options.to}`);
  logger.info(`[EMAIL SIMULATOR] Asunto: ${options.subject}`);
  logger.info(`[EMAIL SIMULATOR] Contenido: ${options.text}`);
  
  // En desarrollo, podrías usar Ethereal Mail o simplemente consola.
  if (env.NODE_ENV === 'development') {
    console.log('---------------------------------------------------------');
    console.log(`PARA: ${options.to}`);
    console.log(`ASUNTO: ${options.subject}`);
    console.log(`MENSAJE: ${options.text}`);
    console.log('---------------------------------------------------------');
  }

  // Aquí iría la lógica real, por ejemplo con Nodemailer:
  /*
  const transporter = nodemailer.createTransport({...});
  await transporter.sendMail({
    from: '"SportMetric" <noreply@sportmetric.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
  */
}

/**
 * Envía el correo de recuperación de contraseña
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Recuperación de contraseña - SportMetric Academic',
    text: `Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar: ${resetUrl}. Este enlace expirará en 1 hora.`,
    html: `<p>Has solicitado restablecer tu contraseña.</p><p>Haz clic en el siguiente enlace para continuar:</p><a href="${resetUrl}">${resetUrl}</a><p>Este enlace expirará en 1 hora.</p>`
  });
}
