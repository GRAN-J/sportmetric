// =============================================================================
// Rutas de Categorías
// =============================================================================
// Define las URLs del API para categorías y asigna los controladores
// =============================================================================

import { Router } from 'express';
import { getCategories, getCategory } from './controllers/category.controller';
import { getProtocolsByCategory } from '../protocols/controllers/protocol.controller';

const router = Router();

// Rutas públicas (no necesitan autenticación)
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/protocols', getProtocolsByCategory);

export default router;
