// =============================================================================
// Rutas de Usuarios (Administración)
// =============================================================================

import { Router } from 'express';
import * as userController from './controllers/user.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();

// Todas las rutas de usuarios requieren ser administrador
router.use(authenticate, authorize('ADMIN'));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.patch('/:id', userController.update);
router.delete('/:id', userController.remove);

export default router;
