import { Router } from 'express';
import { 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Todas as rotas de categoria são protegidas
router.use(verifyToken);

// POST /api/categories
router.post('/', createCategory);

// PUT /api/categories/:id
router.put('/:id', updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', deleteCategory);

export default router;
