import { Router } from 'express';
import { 
  createGiftList, 
  getMyGiftLists, 
  getListBySlug  // <-- Importa a nova função
} from '../controllers/giftlist.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rotas Protegidas (Exigem Login) ---
// Usamos o 'verifyToken' individualmente em cada rota que precisa dele

// POST /api/lists/
// Criar uma nova lista
router.post('/', verifyToken, createGiftList);

// GET /api/lists/
// Buscar todas as listas DO USUÁRIO LOGADO
router.get('/', verifyToken, getMyGiftLists);


// --- Rota Pública (Não exige Login) ---

// GET /api/lists/:slug
// Buscar uma lista pública pelo slug (ex: /api/lists/cha-da-ana)
router.get('/:slug', getListBySlug);


export default router;
