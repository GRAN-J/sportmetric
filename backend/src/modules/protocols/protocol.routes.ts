// =============================================================================
// Rutas de Protocolos
// =============================================================================
// Define las URLs del API para consultar protocolos.
// =============================================================================

import { Router } from 'express';
import * as protocolController from './controllers/protocol.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', protocolController.getProtocols);
router.get('/:id', protocolController.getProtocol);

// Rutas administrativas
router.post('/', authenticate, authorize('ADMIN'), protocolController.create);
router.patch('/:id', authenticate, authorize('ADMIN'), protocolController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), protocolController.remove);

export default router;
