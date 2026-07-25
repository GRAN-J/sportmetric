// =============================================================================
// Rutas de Evaluaciones
// =============================================================================
// La captura (POST) es PÚBLICA porque la Ficha Técnica base se completa sin
// iniciar sesión. El resto de operaciones administrativas mantiene auth.
// =============================================================================

import { Router } from 'express';
import * as evaluationController from './controllers/evaluation.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();

// Captura pública: cualquier visitante puede registrar una evaluación
// una vez completa la Ficha Técnica del protocolo.
router.post('/', evaluationController.register);

// Listado general de evaluaciones (solo Admin)
router.get('/', authenticate, authorize('ADMIN'), evaluationController.getAll);

// Ver historial de un estudiante por su `id_estudiante` (Ficha Técnica base).
router.get('/student/:studentId', authenticate, authorize('ADMIN'), evaluationController.getHistory);

// Actualizar o eliminar evaluaciones (solo Admin)
router.patch('/:id', authenticate, authorize('ADMIN'), evaluationController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), evaluationController.remove);

// Ver detalle de una evaluación
router.get('/:id', authenticate, authorize('ADMIN'), evaluationController.getDetail);

export default router;
