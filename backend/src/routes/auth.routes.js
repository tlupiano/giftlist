import { Router } from 'express';
// Importa as funções de lógica do nosso controller
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// Define os endpoints e qual função eles chamam
router.post('/register', register);
router.post('/login', login);

export default router;
