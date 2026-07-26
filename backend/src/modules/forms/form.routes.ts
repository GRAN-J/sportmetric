// =============================================================================
// Rutas de Esquemas de Formulario
// =============================================================================

import { Router } from 'express';
import * as formController from './controllers/form.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();

// El esquema es metadata del protocolo: cualquier usuario (incluso visitante)
// puede consultarlo para renderizar el formulario de registro correctamente.
router.get('/:protocolId', formController.getSchema);

// Solo administradores pueden definir esquemas
router.post('/:protocolId', authenticate, authorize('ADMIN'), formController.saveSchema);

export default router;
