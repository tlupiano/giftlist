import express from 'express';
import cors from 'cors';

// Importa nossas novas rotas de autenticação
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
// Permite que o frontend (localhost:5173) acesse a API
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Importante para quando usarmos cookies
}));
// Permite que o Express leia JSON no corpo das requisições
app.use(express.json());

// --- Rotas ---
// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API da Lista de Presentes está funcionando!' });
});

// ADICIONA AS ROTAS DE AUTENTICAÇÃO
// Todas as rotas em 'authRoutes' terão o prefixo /api/auth
// Ex: /api/auth/register, /api/auth/login
app.use('/api/auth', authRoutes);


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`[BACKEND] Servidor rodando na porta ${PORT}`);
});

