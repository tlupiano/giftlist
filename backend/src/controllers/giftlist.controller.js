import prisma from '../lib/prisma.js';

// --- Criar uma nova Lista de Presentes (Protegido) ---
export const createGiftList = async (req, res) => {
  // ... (código existente, sem alteração) ...
  const { title, description, eventDate, slug } = req.body;
  const userId = req.userId; 

  if (!title || !slug) {
    return res.status(400).json({ message: 'Título e Slug (URL) são obrigatórios.' });
  }

  try {
    const existingSlug = await prisma.giftList.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(409).json({ message: 'Esta URL (slug) já está em uso. Escolha outra.' });
    }

    const newList = await prisma.giftList.create({
      data: {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
        slug,
        userId, 
      },
    });

    res.status(201).json(newList);

  } catch (error) {
    console.error('[GIFT_LIST_CREATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao criar a lista de presentes.' });
  }
};

// --- Buscar todas as listas do usuário logado (Protegido) ---
export const getMyGiftLists = async (req, res) => {
  // ... (código existente, sem alteração) ...
  const userId = req.userId; 

  try {
    const lists = await prisma.giftList.findMany({
      where: {
        userId: userId, 
      },
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

// --- NOVO: Buscar uma lista pública pelo Slug (Público) ---
export const getListBySlug = async (req, res) => {
  const { slug } = req.params; // Pega o slug da URL (ex: /api/lists/cha-da-ana)

  try {
    const list = await prisma.giftList.findUnique({
      where: {
        slug: slug,
      },
      // Inclui os itens e o nome do criador
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        user: {
          select: {
            name: true, // Seleciona apenas o nome do usuário
          },
        },
      },
    });

    // Se a lista não for encontrada
    if (!list) {
      return res.status(404).json({ message: 'Lista de presentes não encontrada.' });
    }

    res.status(200).json(list);

  } catch (error) {
    console.error('[GIFT_LIST_GET_SLUG] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar a lista.' });
  }
};
