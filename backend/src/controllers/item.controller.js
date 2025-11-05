import prisma from '../lib/prisma.js';

// --- Criar um novo Item (Protegido - Dono) ---
// *** MUDANÇA SIGNIFICATIVA AQUI ***
export const createItem = async (req, res) => {
  // 1. Agora recebemos 'categoryId' em vez de 'listId'
  const { name, price, linkUrl, imageUrl, description, categoryId } = req.body;
  const userId = req.userId; 

  if (!name || !categoryId) {
    return res.status(400).json({ message: 'Nome do item e ID da Categoria são obrigatórios.' });
  }

  try {
    // 2. Verificamos se a categoria existe E se o usuário é o dono
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { list: true }, // Puxamos a lista para verificar o dono
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    if (category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista/categoria.' });
    }

    // 3. Criamos o item LIGADO à categoria
    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        linkUrl,
        imageUrl,
        categoryId: categoryId, // 4. Usamos categoryId
      },
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('[ITEM_CREATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar o item.' });
  }
};

// --- Atualizar um Item (Protegido - Dono) ---
// *** MUDANÇA SIGNIFICATIVA AQUI ***
export const updateItem = async (req, res) => {
  const { id } = req.params; 
  const { name, price, linkUrl, imageUrl, description, categoryId } = req.body; // 1. Pode-se mudar a categoria
  const userId = req.userId;

  try {
    // 2. Verificamos se o item existe e quem é o dono
    const item = await prisma.item.findUnique({
      where: { id },
      include: { category: { include: { list: true } } }, // Puxa item -> categoria -> lista
    });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    // 3. A verificação de dono agora é mais "funda"
    if (item.category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    // 4. (Opcional) Se o usuário mandou um novo categoryId, verificamos se ele é dono
    if (categoryId && categoryId !== item.categoryId) {
      const newCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { list: true },
      });
      if (!newCategory || newCategory.list.userId !== userId) {
        return res.status(403).json({ message: 'Acesso negado. Categoria de destino inválida.' });
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        linkUrl,
        imageUrl,
        categoryId: categoryId || item.categoryId, // 5. Atualiza a categoria se ela foi enviada
      },
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_UPDATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar o item.' });
  }
};

// --- Deletar um Item (Protegido - Dono) ---
// *** MUDANÇA SIGNIFICATIVA AQUI ***
export const deleteItem = async (req, res) => {
  const { id } = req.params; 
  const userId = req.userId;

  try {
    // 1. Verificação de dono mais "funda"
    const item = await prisma.item.findUnique({
      where: { id },
      include: { category: { include: { list: true } } },
    });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    await prisma.item.delete({ where: { id } });
    res.status(204).send(); 
  } catch (error) {
    console.error('[ITEM_DELETE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao deletar o item.' });
  }
};

// --- Funções de Reserva (Públicas / Dono) ---
// *** MUDANÇAS MENORES AQUI *** (só na verificação de dono)

export const reserveItem = async (req, res) => {
  const { id } = req.params;
  const { purchaserName, purchaserEmail } = req.body;

  if (!purchaserName) {
    return res.status(400).json({ message: 'Seu nome é obrigatório para reservar o item.' });
  }

  try {
    // Não precisamos checar o dono aqui, pois é uma rota pública
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.status !== 'AVAILABLE') {
      return res.status(409).json({ message: 'Opa! Este item não está mais disponível para reserva.' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        status: 'RESERVED',
        purchaserName: purchaserName,
        purchaserEmail: purchaserEmail,
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_RESERVE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao reservar o item.' });
  }
};

export const confirmPurchase = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // 1. Verificação de dono mais "funda"
    const item = await prisma.item.findUnique({
      where: { id },
      include: { category: { include: { list: true } } },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }
    if (item.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Este item não está reservado para ser confirmado.' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: { status: 'PURCHASED' },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_CONFIRM] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao confirmar a compra.' });
  }
};

export const cancelReservation = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // 1. Verificação de dono mais "funda"
    const item = await prisma.item.findUnique({
      where: { id },
      include: { category: { include: { list: true } } },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }
    if (item.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Este item não está reservado para ser cancelado.' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        status: 'AVAILABLE',
        purchaserName: null,
        purchaserEmail: null,
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_CANCEL] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao cancelar a reserva.' });
  }
};
