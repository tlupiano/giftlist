import { Router } from 'express';
import { 
  createGiftList, 
  getMyGiftLists, 
  getListBySlug,
  updateGiftList,
  deleteGiftList,       // <-- Agora a importação está correta
  createListFromTemplate
} from '../controllers/giftlist.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rota Pública (Não exige Login) ---
// GET /api/lists/:slug
// NOTA: Rotas públicas com parâmetros (como :slug) devem vir 
// preferencialmente DEPOIS de rotas protegidas estáticas se houver conflito,
// mas como o método (GET) é diferente do (POST), não há conflito.
// Deixaremos aqui por clareza.
router.get('/:slug', getListBySlug);


// --- Rotas Protegidas (Exigem Login) ---
// Aplicamos o middleware para TODAS as rotas abaixo
router.use(verifyToken); 

// POST /api/lists/
// Criar uma nova lista (Manual)
router.post('/', createGiftList);

// POST /api/lists/from-template
// Criar uma nova lista (Usando Template)
router.post('/from-template', createListFromTemplate); 

// GET /api/lists/
// Buscar todas as listas DO USUÁRIO LOGADO
// (Nota: Esta rota GET / não conflita com GET /:slug 
// porque o /:slug público não passa pelo verifyToken)
router.get('/', getMyGiftLists);

// PUT /api/lists/:slug
// Atualizar uma lista
router.put('/:slug', updateGiftList);

// DELETE /api/lists/:slug
// Deletar uma lista (ROTA QUE FALTAVA)
router.delete('/:slug', deleteGiftList);


export default router;