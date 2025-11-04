import { Router } from 'express';
import { createGiftList, getMyGiftLists } from '../controllers/giftlist.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar o middleware verifyToken em todas as rotas deste arquivo
router.use(verifyToken);

// POST /api/lists/
// Criar uma nova lista
router.post('/', createGiftList);

// GET /api/lists/
// Buscar todas as listas do usuário logado
router.get('/', getMyGiftLists);

export default router;
