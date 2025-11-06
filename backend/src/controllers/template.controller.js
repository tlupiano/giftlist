import prisma from '../lib/prisma.js';

// --- Buscar todos os Templates (Público) ---
// Esta rota será usada pelo frontend para mostrar os botões
// (Ex: "Criar Lista de Casamento")
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.listTemplate.findMany({
      orderBy: {
        name: 'asc', // Ordena alfabeticamente
      },
      // Incluímos categorias e itens para (opcionalmente) mostrar detalhes no frontend
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });
    res.status(200).json(templates);
  } catch (error) {
    console.error('[TEMPLATE_GET_ALL] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar os modelos de lista.' });
  }
};