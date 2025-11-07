import prisma from '../lib/prisma.js';
import { getIO } from '../socket.js'; // <-- SUGESTÃO 3

// --- Criar um novo Item (Protegido - Dono) ---
export const createItem = async (req, res) => {
  // ... (código existente sem alteração)
  const { name, price, linkUrl, imageUrl, description, categoryId } = req.body;
  const userId = req.userId; 

  if (!name || !categoryId) {
    return res.status(400).json({ message: 'Nome do item e ID da Categoria são obrigatórios.' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { 
        list: { 
          select: { userId: true, slug: true } // <-- SUGESTÃO 3: Incluir slug
        } 
      }, 
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    if (category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista/categoria.' });
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        linkUrl,
        imageUrl,
        categoryId: categoryId, 
      },
    });

    // --- SUGESTÃO 3: Emitir evento de novo item ---
    // (O 'item:updated' pode ser usado para adicionar/atualizar)
    const slug = category.list.slug;
    getIO().to(slug).emit('item:created', newItem);
    // --- FIM DA SUGESTÃO 3 ---

    res.status(201).json(newItem);
  } catch (error) {
    console.error('[ITEM_CREATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar o item.' });
  }
};

// --- Atualizar um Item (Protegido - Dono) ---
export const updateItem = async (req, res) => {
  const { id } = req.params; 
  const { name, price, linkUrl, imageUrl, description, categoryId } = req.body;
  const userId = req.userId;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { 
        category: { 
          include: { 
            list: { 
              select: { userId: true, slug: true } // <-- SUGESTÃO 3
            } 
          } 
        } 
      },
    });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    // ... (lógica de verificação da nova categoria, se houver)
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
        categoryId: categoryId || item.categoryId,
      },
    });

    // --- SUGESTÃO 3: Emitir evento de atualização ---
    const slug = item.category.list.slug;
    getIO().to(slug).emit('item:updated', updatedItem);
    // --- FIM DA SUGESTÃO 3 ---

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_UPDATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar o item.' });
  }
};

// --- Deletar um Item (Protegido - Dono) ---
export const deleteItem = async (req, res) => {
  const { id } = req.params; 
  const userId = req.userId;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { 
        category: { 
          include: { 
            list: { 
              select: { userId: true, slug: true } // <-- SUGESTÃO 3
            } 
          } 
        } 
      },
    });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    await prisma.item.delete({ where: { id } });

    // --- SUGESTÃO 3: Emitir evento de deleção ---
    const slug = item.category.list.slug;
    getIO().to(slug).emit('item:deleted', { id: item.id, categoryId: item.categoryId });
    // --- FIM DA SUGESTÃO 3 ---

    res.status(204).send(); 
  } catch (error) {
    console.error('[ITEM_DELETE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao deletar o item.' });
  }
};

// --- Funções de Reserva (Públicas / Dono) ---

export const reserveItem = async (req, res) => {
  const { id } = req.params;
  const { purchaserName, purchaserEmail } = req.body;

  if (!purchaserName) {
    return res.status(400).json({ message: 'Seu nome é obrigatório para reservar o item.' });
  }

  try {
    const item = await prisma.item.findUnique({ 
      where: { id },
      include: { 
        category: { 
          include: { 
            list: { 
              select: { slug: true } // <-- SUGESTÃO 3
            } 
          } 
        } 
      } 
    });
    
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

    // --- SUGESTÃO 3: Emitir evento ---
    const slug = item.category.list.slug;
    getIO().to(slug).emit('item:updated', updatedItem);
    // --- FIM DA SUGESTÃO 3 ---

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
    const item = await prisma.item.findUnique({
      where: { id },
      include: { 
        category: { 
          include: { 
            list: { 
              select: { userId: true, slug: true } // <-- SUGESTÃO 3
            } 
          } 
        } 
      },
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
    
    // --- SUGESTÃO 3: Emitir evento ---
    const slug = item.category.list.slug;
    getIO().to(slug).emit('item:updated', updatedItem);
    // --- FIM DA SUGESTÃO 3 ---

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
    const item = await prisma.item.findUnique({
      where: { id },
      include: { 
        category: { 
          include: { 
            list: { 
              select: { userId: true, slug: true } // <-- SUGESTÃO 3
            } 
          } 
        } 
      },
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

    // --- SUGESTÃO 3: Emitir evento ---
    const slug = item.category.list.slug;
    getIO().to(slug).emit('item:updated', updatedItem);
    // --- FIM DA SUGESTÃO 3 ---

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ITEM_CANCEL] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao cancelar a reserva.' });
  }
};