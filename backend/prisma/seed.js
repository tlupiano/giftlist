/**
 * Script para popular o banco de dados com templates de lista.
 * * Como rodar:
 * 1. Adicione o script "prisma:seed": "node prisma/seed.js" em package.json
 * 2. Rode: npm run prisma:seed
 * * (Ou rode "npx prisma db seed" se o "seed" estiver definido no package.json)
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seed...');

  // --- Template 1: Chá de Bebê ---
  console.log('Criando template: Chá de Bebê...');
  const chaDeBebe = await prisma.listTemplate.upsert({
    where: { name: 'Chá de Bebê' },
    update: {},
    create: {
      name: 'Chá de Bebê',
      description: 'Um modelo inicial para seu chá de bebê, com itens essenciais para o quarto, banho e passeio.',
      icon: 'baby',
      categories: {
        create: [
          // Categoria: Quarto do Bebê
          {
            name: 'Quarto do Bebê',
            icon: '🛌', // <-- ALTERAÇÃO 3
            items: {
              create: [
                { name: 'Berço', description: 'Berço padrão americano com colchão.' },
                { name: 'Cômoda Trocador', description: 'Cômoda com espaço para trocador.' },
                { name: 'Poltrona de Amamentação' },
                { name: 'Kit Berço', description: 'Protetores laterais, lençol e edredom.' },
              ],
            },
          },
          // Categoria: Hora do Banho
          {
            name: 'Hora do Banho',
            icon: '🛁', // <-- ALTERAÇÃO 3
            items: {
              create: [
                { name: 'Banheira com Suporte' },
                { name: 'Kit Toalhas com Capuz', description: 'Pelo menos 3 unidades.' },
                { name: 'Kit Higiene', description: 'Cotonetes, algodão, sabonete líquido neutro, etc.' },
              ],
            },
          },
          // Categoria: Alimentação
          {
            name: 'Alimentação',
            icon: '🍼', // <-- ALTERAÇÃO 3
            items: {
              create: [
                { name: 'Cadeira de Alimentação (Cadeirão)' },
                { name: 'Kit Mamadeiras (P, M, G)' },
                { name: 'Esterilizador de Mamadeiras para Micro-ondas' },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`Template 'Chá de Bebê' criado/atualizado (ID: ${chaDeBebe.id})`);

  // --- Template 2: Lista de Casamento ---
  console.log('Criando template: Lista de Casamento...');
  const casamento = await prisma.listTemplate.upsert({
    where: { name: 'Lista de Casamento' },
    update: {},
    create: {
      name: 'Lista de Casamento',
      description: 'Sugestões de presentes clássicos para mobiliar sua nova casa.',
      icon: 'ring',
      categories: {
        create: [
          // Categoria: Cozinha
          {
            name: 'Cozinha',
            icon: '🍳', // <-- ALTERAÇÃO 3
            items: {
              create: [
                { name: 'Aparelho de Jantar', description: 'Completo, 42 peças.', price: 500.00 },
                { name: 'Faqueiro', description: 'Inox, 101 peças.', price: 350.00 },
                { name: 'Jogo de Panelas', description: 'Antiaderente, 5 peças.', price: 400.00 },
                { name: 'Airfryer', price: 600.00 },
              ],
            },
          },
          // Categoria: Eletrodomésticos
          {
            name: 'Eletrodomésticos',
            icon: '🔌', // <-- ALTERAÇÃO 3
            items: {
              create: [
                { name: 'Geladeira Duplex', price: 3500.00 },
                { name: 'Fogão 5 bocas', price: 1500.00 },
                { name: 'Micro-ondas', price: 700.00 },
                { name: 'Máquina de Lavar Roupas', price: 2200.00 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`Template 'Lista de Casamento' criado/atualizado (ID: ${casamento.id})`);
  
  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });