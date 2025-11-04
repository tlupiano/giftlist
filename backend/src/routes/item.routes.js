import { Router } from 'express';
import { 
  createItem, 
  updateItem, 
  deleteItem, 
  reserveItem,       // <-- MUDOU: de 'purchaseItem' para 'reserveItem'
  confirmPurchase,   // <-- NOVO
  cancelReservation  // <-- NOVO
} from '../controllers/item.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rotas Protegidas (Dono da Lista) ---
// Usamos o 'verifyToken' para garantir que o usuário está logado
router.post('/', verifyToken, createItem);
router.put('/:id', verifyToken, updateItem);
router.delete('/:id', verifyToken, deleteItem);

// --- NOVAS Rotas Protegidas (Dono da Lista) ---
// Para moderar as reservas
router.patch('/:id/confirm', verifyToken, confirmPurchase);
router.patch('/:id/cancel', verifyToken, cancelReservation);


// --- Rota Pública (Convidados) ---
// MUDOU: de 'purchase' para 'reserve'
// Marcar um item como reservado (não precisa de token)
router.patch('/:id/reserve', reserveItem);

export default router;
