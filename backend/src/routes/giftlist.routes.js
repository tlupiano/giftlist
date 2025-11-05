import { Router } from 'express';
import { 
  createGiftList, 
  getMyGiftLists, 
  getListBySlug,
  updateGiftList, // <-- NOVO
  deleteGiftList  // <-- NOVO
} from '../controllers/giftlist.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rota Pública (Não exige Login) ---

// GET /api/lists/:slug
// Buscar uma lista pública pelo slug (ex: /api/lists/cha-da-ana)
router.get('/:slug', getListBySlug);


// --- Rotas Protegidas (Exigem Login) ---
// Aplicamos o middleware para TODAS as rotas abaixo
router.use(verifyToken); 

// POST /api/lists/
// Criar uma nova lista
router.post('/', createGiftList);

// GET /api/lists/
// Buscar todas as listas DO USUÁRIO LOGADO
router.get('/', getMyGiftLists); // Esta rota é /api/lists/ e não conflita com /:slug

// PUT /api/lists/:slug
// Atualizar uma lista
router.put('/:slug', updateGiftList);

// DELETE /api/lists/:slug
// Deletar uma lista
router.delete('/:slug', deleteGiftList);


export default router;