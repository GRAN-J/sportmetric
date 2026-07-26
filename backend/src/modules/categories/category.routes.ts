// =============================================================================
// Rutas de Categorías
// =============================================================================
// Define las URLs del API para categorías y asigna los controladores
// =============================================================================

import { Router } from 'express';
import * as categoryController from './controllers/category.controller';
import { getProtocolsByCategory } from '../protocols/controllers/protocol.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/protocols', getProtocolsByCategory);

// Rutas administrativas
router.post('/', authenticate, authorize('ADMIN'), categoryController.create);
router.patch('/:id', authenticate, authorize('ADMIN'), categoryController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.remove);

export default router;
