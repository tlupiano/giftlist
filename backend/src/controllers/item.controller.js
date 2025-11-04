import prisma from '../lib/prisma.js';

// --- Criar um novo Item (Protegido - Dono) ---
export const createItem = async (req, res) => {
  // ... (código existente, sem alteração) ...
  const { name, price, linkUrl, imageUrl, description, listId } = req.body;
  const userId = req.userId; 

  if (!name || !listId) {
    return res.status(400).json({ message: 'Nome do item e ID da lista são obrigatórios.' });
  }

  try {
    const list = await prisma.giftList.findUnique({ where: { id: listId } });
    if (!list) {
      return res.status(404).json({ message: 'Lista não encontrada.' });
    }
    if (list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        linkUrl,
        imageUrl,
        listId, 
      },
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('[ITEM_CREATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar o item.' });
  }
};

// --- Atualizar um Item (Protegido - Dono) ---
export const updateItem = async (req, res) => {
  // ... (código existente, sem alteração) ...
  const { id } = req.params; 
  const { name, price, linkUrl, imageUrl, description } = req.body;
  const userId = req.userId;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true }, 
    });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        linkUrl,
        imageUrl,
      },
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_UPDATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar o item.' });
  }
};

// --- Deletar um Item (Protegido - Dono) ---
export const deleteItem = async (req, res) => {
  // ... (código existente, sem alteração) ...
  const { id } = req.params; 
  const userId = req.userId;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true },
    });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    await prisma.item.delete({ where: { id } });
    res.status(204).send(); 
  } catch (error) {
    console.error('[ITEM_DELETE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao deletar o item.' });
  }
};

// --- MUDANÇA: 'purchaseItem' virou 'reserveItem' (Público - Convidado) ---
export const reserveItem = async (req, res) => {
  const { id } = req.params; // ID do item
  const { purchaserName, purchaserEmail } = req.body; // Dados do convidado

  if (!purchaserName) {
    return res.status(400).json({ message: 'Seu nome é obrigatório para reservar o item.' });
  }

  try {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    // Só pode reservar se estiver DISPONÍVEL
    if (item.status !== 'AVAILABLE') {
      return res.status(409).json({ message: 'Opa! Este item não está mais disponível para reserva.' });
    }

    // Atualiza o status e salva o nome do convidado
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

// --- NOVO: Confirmar Compra (Protegido - Dono) ---
export const confirmPurchase = async (req, res) => {
  const { id } = req.params; // ID do item
  const userId = req.userId; // ID do Dono

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true }, // Pega a lista para verificar o dono
    });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }
    if (item.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Este item não está reservado para ser confirmado.' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        status: 'PURCHASED', // Muda de RESERVED para PURCHASED
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_CONFIRM] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao confirmar a compra.' });
  }
};

// --- NOVO: Cancelar Reserva (Protegido - Dono) ---
export const cancelReservation = async (req, res) => {
  const { id } = req.params; // ID do item
  const userId = req.userId; // ID do Dono

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { list: true },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }
    if (item.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Este item não está reservado para ser cancelado.' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        status: 'AVAILABLE', // Volta a ficar disponível
        purchaserName: null,  // Limpa os dados do convidado
        purchaserEmail: null,
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_CANCEL] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao cancelar a reserva.' });
  }
};
