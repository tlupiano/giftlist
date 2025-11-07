import { Router } from 'express';
import { sendThankYouEmail } from '../controllers/email.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Todas as rotas de e-mail são protegidas
router.use(verifyToken);

// POST /api/email/thank/:id (onde :id é o ID do *Item*)
router.post('/thank/:id', sendThankYouEmail);

export default router;