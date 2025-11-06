import { Router } from 'express';
import { getAllTemplates } from '../controllers/template.controller.js';

const router = Router();

// Rota pública para buscar todos os modelos de lista
// GET /api/templates
router.get('/', getAllTemplates);

export default router;