import prisma from '../lib/prisma.js';

// --- Criar uma nova Lista de Presentes (Protegido) ---
export const createGiftList = async (req, res) => {
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

// --- Buscar uma lista pública pelo Slug (Público) ---
export const getListBySlug = async (req, res) => {
  const { slug } = req.params; 

  try {
    const list = await prisma.giftList.findUnique({
      where: {
        slug: slug,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            items: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!list) {
      return res.status(404).json({ message: 'Lista de presentes não encontrada.' });
    }

    res.status(200).json(list);

  } catch (error) {
    console.error('[GIFT_LIST_GET_SLUG] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar a lista.' });
  }
};

// --- NOVO: Atualizar uma Lista (Protegido - Dono) ---
export const updateGiftList = async (req, res) => {
  const { slug } = req.params;
  const { title, description, eventDate } = req.body;
  const userId = req.userId;

  // Slug não pode ser alterado, mas título é obrigatório
  if (!title) {
    return res.status(400).json({ message: 'O título é obrigatório.' });
  }

  try {
    // 1. Encontra a lista para verificar o dono
    const list = await prisma.giftList.findUnique({
      where: { slug },
    });

    if (!list) {
      return res.status(404).json({ message: 'Lista não encontrada.' });
    }
    if (list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Esta lista não é sua.' });
    }

    // 2. Atualiza a lista
    const updatedList = await prisma.giftList.update({
      where: { slug },
      data: {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    });

    res.status(200).json(updatedList);
  } catch (error) {
    console.error('[GIFT_LIST_UPDATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar a lista.' });
  }
};

// --- NOVO: Deletar uma Lista (Protegido - Dono) ---
export const deleteGiftList = async (req, res) => {
  const { slug } = req.params;
  const userId = req.userId;

  try {
    // 1. Encontra a lista para verificar o dono
    const list = await prisma.giftList.findUnique({
      where: { slug },
    });

    if (!list) {
      return res.status(404).json({ message: 'Lista não encontrada.' });
    }
    if (list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Esta lista não é sua.' });
    }

    // 2. Deleta a lista
    // O Prisma (onDelete: Cascade) cuidará de deletar categorias e itens
    await prisma.giftList.delete({
      where: { slug },
    });

    res.status(204).send(); // OK, sem conteúdo
  } catch (error) {
    console.error('[GIFT_LIST_DELETE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao deletar a lista.' });
  }
};