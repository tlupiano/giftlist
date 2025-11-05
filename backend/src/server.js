import express from 'express';
import cors from 'cors';

// Importa as rotas
import authRoutes from './routes/auth.routes.js';
import giftListRoutes from './routes/giftlist.routes.js';
import itemRoutes from './routes/item.routes.js';
import categoryRoutes from './routes/category.routes.js'; // <-- 1. IMPORTAR

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

// Rotas da Lista de Presentes
app.use('/api/lists', giftListRoutes);

// Rotas dos Itens
app.use('/api/items', itemRoutes);

// Rotas das Categorias (NOVAS)
app.use('/api/categories', categoryRoutes); // <-- 2. USAR


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`[BACKEND] Servidor rodando na porta ${PORT}`);
});
