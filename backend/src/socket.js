import { Server } from 'socket.io';

let io;

const allowedOrigins = [
  `${process.env.URL}`,
  'http://localhost:5173',
  'http://192.168.0.3:5173'
];

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins, // Permite conexão do frontend
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Novo cliente conectado: ${socket.id}`);
    
    // Quando um cliente entra em uma "sala" (página da lista)
    socket.on('joinListRoom', (slug) => {
      if(slug) {
        socket.join(slug);
        console.log(`[SOCKET] Cliente ${socket.id} entrou na sala: ${slug}`);
      }
    });

    // Quando um cliente sai da sala
    socket.on('leaveListRoom', (slug) => {
      if(slug) {
        socket.leave(slug);
        console.log(`[SOCKET] Cliente ${socket.id} saiu da sala: ${slug}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Retorna a instância do Socket.io
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io não foi inicializado!");
  }
  return io;
};