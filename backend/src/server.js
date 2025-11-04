import express from 'express';
import cors from 'cors';

// Importa nossas novas rotas de autenticação
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));
app.use(express.json());

// --- Rotas ---
// Rota de teste raiz (para o App.jsx antigo)
app.get('/', (req, res) => {
  res.json({ message: 'API da Lista de Presentes está funcionando!' });
});
// Rota de teste (para garantir)
app.get('/api/test', (req, res) => {
  res.json({ message: 'API da Lista de Presentes está funcionando!' });
});

// ADICIONA AS ROTAS DE AUTENTICAÇÃO
app.use('/api/auth', authRoutes);


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`[BACKEND] Servidor rodando na porta ${PORT}`);
});
