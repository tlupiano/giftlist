import express from 'express';
import cors from 'cors';

// Importa as rotas
import authRoutes from './routes/auth.routes.js';
import giftListRoutes from './routes/giftlist.routes.js'; // <-- NOSSA NOVA ROTA

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// --- Rotas ---
app.get('/api', (req, res) => {
  res.json({ message: 'API da Lista de Presentes está funcionando!' });
});

// Rotas de Autenticação
app.use('/api/auth', authRoutes);

// Rotas da Lista de Presentes (Protegidas)
app.use('/api/lists', giftListRoutes); // <-- USANDO AS NOVAS ROTAS


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`[BACKEND] Servidor rodando na porta ${PORT}`);
});
