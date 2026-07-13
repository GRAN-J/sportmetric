// =============================================================================
// Rutas de Protocolos
// =============================================================================
// Define las URLs del API para consultar protocolos.
// =============================================================================

import { Router } from 'express';
import { getProtocol, getProtocols } from './controllers/protocol.controller';

const router = Router();

router.get('/', getProtocols);
router.get('/:id', getProtocol);

export default router;
