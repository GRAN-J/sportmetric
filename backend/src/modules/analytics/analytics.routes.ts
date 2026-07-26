// =============================================================================
// Rutas de Analítica
// =============================================================================

import { Router } from 'express';
import * as analyticsController from './controllers/analytics.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();

// Protegidas para administradores
router.use(authenticate, authorize('ADMIN'));

router.get('/summary', analyticsController.getSummary);
router.get('/activity', analyticsController.getActivity);
router.get('/top-protocols', analyticsController.getTopProtocols);

export default router;
