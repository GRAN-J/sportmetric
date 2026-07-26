// =============================================================================
// Rutas de Autenticación
// =============================================================================
// Define los endpoints para el registro, login y gestión de tokens.
// =============================================================================

import { Router } from 'express';
import * as authController from './controllers/auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
