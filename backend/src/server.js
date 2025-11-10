import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http'; // <-- SUGESTÃO 3: Importar http
import { initSocket } from './socket.js'; // <-- SUGESTÃO 3: Importar initSocket

// Importa as rotas
import authRoutes from './routes/auth.routes.js';
import giftListRoutes from './routes/giftlist.routes.js';
import itemRoutes from './routes/item.routes.js';
import categoryRoutes from './routes/category.routes.js';
import templateRoutes from './routes/template.routes.js';
import emailRoutes from './routes/email.routes.js'; // <-- SUGESTÃO 2: Importar emailRoutes

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
  origin: `${process.env.URL}`,
  credentials: true,
}));

// Aumenta o limite do payload para aceitar imagens Base64
app.use(express.json({ limit: '5mb' }));

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

// Rotas das Categorias
app.use('/api/categories', categoryRoutes);

// Rotas dos Templates
app.use('/api/templates', templateRoutes);

// --- SUGESTÃO 2: Adicionar Rota de E-mail ---
app.use('/api/email', emailRoutes); 


// --- SUGESTÃO 3: Configuração do Servidor HTTP e Socket.io ---
// 1. Criar o servidor HTTP a partir do app Express
const httpServer = http.createServer(app);

// 2. Inicializar o Socket.io com o servidor HTTP
const io = initSocket(httpServer);
// --- FIM DA SUGESTÃO 3 ---


// --- Inicialização do Servidor ---
// 3. Usar httpServer.listen() em vez de app.listen()
httpServer.listen(PORT, () => {
  console.log(`[BACKEND] Servidor rodando na porta ${PORT}`);
});