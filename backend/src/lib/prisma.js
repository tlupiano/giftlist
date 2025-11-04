import { PrismaClient } from '@prisma/client'

// Instancia o cliente do Prisma
const prisma = new PrismaClient({
  // Ativa os logs para vermos as queries no console
  log: ['query', 'info', 'warn', 'error'],
});

// Exporta a instância para ser usada em outras partes do app
export default prisma;
