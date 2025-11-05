import prisma from '../lib/prisma.js';

// --- Criar uma nova Categoria (Protegido - Dono) ---
export const createCategory = async (req, res) => {
  const { name, listId } = req.body;
  const userId = req.userId;

  if (!name || !listId) {
    return res.status(400).json({ message: 'Nome e ID da Lista são obrigatórios.' });
  }

  try {
    // Verifica se o usuário é o dono da lista onde quer criar a categoria
    const list = await prisma.giftList.findUnique({ where: { id: listId } });
    if (list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Esta lista não é sua.' });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        listId,
      },
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('[CATEGORY_CREATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao criar a categoria.' });
  }
};

// --- Atualizar uma Categoria (Protegido - Dono) ---
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.userId;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { list: true },
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    if (category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('[CATEGORY_UPDATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar a categoria.' });
  }
};

// --- Deletar uma Categoria (Protegido - Dono) ---
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { list: true },
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    if (category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    
    // O banco de dados está configurado para 'onDelete: Cascade',
    // então deletar a categoria também deletará todos os itens dentro dela.
    await prisma.category.delete({ where: { id } });

    res.status(204).send(); // OK, sem conteúdo
  } catch (error) {
    console.error('[CATEGORY_DELETE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao deletar a categoria.' });
  }
};
