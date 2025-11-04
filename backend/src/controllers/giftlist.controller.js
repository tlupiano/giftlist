import prisma from '../lib/prisma.js';

// --- Criar uma nova Lista de Presentes ---
export const createGiftList = async (req, res) => {
  const { title, description, eventDate, slug } = req.body;
  
  // Pegamos o userId que o middleware 'verifyToken' anexou
  const userId = req.userId; 

  // Validação básica
  if (!title || !slug) {
    return res.status(400).json({ message: 'Título e Slug (URL) são obrigatórios.' });
  }

  try {
    // Verifica se o slug (URL amigável) já está em uso
    const existingSlug = await prisma.giftList.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(409).json({ message: 'Esta URL (slug) já está em uso. Escolha outra.' });
    }

    // Cria a lista no banco, conectando-a ao usuário
    const newList = await prisma.giftList.create({
      data: {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
        slug,
        userId, // Conecta a lista ao usuário logado
      },
    });

    res.status(201).json(newList);

  } catch (error) {
    console.error('[GIFT_LIST_CREATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao criar a lista de presentes.' });
  }
};

// --- Buscar todas as listas do usuário logado ---
export const getMyGiftLists = async (req, res) => {
  const userId = req.userId; // ID do usuário vindo do token

  try {
    const lists = await prisma.giftList.findMany({
      where: {
        userId: userId, // Filtra apenas as listas deste usuário
      },
      // Ordena pelas mais recentes
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(lists);

  } catch (error) {
    console.error('[GIFT_LIST_GET_MY] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar as listas de presentes.' });
  }
};
