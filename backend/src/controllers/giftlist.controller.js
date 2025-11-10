import { getIO } from '../socket.js';
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

// --- NOVO: Criar Lista a partir de Template (Protegido) ---
export const createListFromTemplate = async (req, res) => {
  // Recebemos os dados do formulário e o ID do template
  const { title, description, eventDate, slug, templateId } = req.body;
  const userId = req.userId;

  if (!title || !slug || !templateId) {
    return res.status(400).json({ message: 'Título, Slug (URL) e ID do Modelo são obrigatórios.' });
  }

  try {
    // 1. Verificar se o slug já está em uso
    const existingSlug = await prisma.giftList.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return res.status(409).json({ message: 'Esta URL (slug) já está em uso. Escolha outra.' });
    }

    // 2. Buscar o template completo
    const template = await prisma.listTemplate.findUnique({
      where: { id: templateId },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });
    if (!template) {
      return res.status(404).json({ message: 'Modelo de lista não encontrado.' });
    }

    // 3. Usar uma transação para criar a lista, categorias e itens
    const newList = await prisma.$transaction(async (tx) => {
      // 3a. Criar a GiftList principal
      const createdList = await tx.giftList.create({
        data: {
          title,
          description: description || template.description, // Usa a descrição do template se nenhuma for fornecida
          eventDate: eventDate ? new Date(eventDate) : null,
          slug,
          userId,
        },
      });

      // 3b. Iterar sobre as categorias do template
      for (const templateCategory of template.categories) {
        // Criar a Categoria real (nova)
        const createdCategory = await tx.category.create({
          data: {
            name: templateCategory.name,
            listId: createdList.id,
          },
        });

        // 3c. Preparar os itens (baseados no template) para criação
        const itemsToCreate = templateCategory.items.map(templateItem => ({
          name: templateItem.name,
          description: templateItem.description,
          price: templateItem.price,
          imageUrl: templateItem.imageUrl,
          linkUrl: templateItem.linkUrl,
          categoryId: createdCategory.id, // Liga o item à nova categoria
          status: 'AVAILABLE', // Todos começam como disponíveis
        }));

        // Criar todos os itens desta categoria de uma vez (mais rápido)
        if (itemsToCreate.length > 0) {
          await tx.item.createMany({
            data: itemsToCreate,
          });
        }
      }

      // O retorno da transação é a lista criada
      return createdList;
    });

    // 4. Retornar a nova lista criada
    res.status(201).json(newList);

  } catch (error) {
    console.error('[GIFT_LIST_CREATE_FROM_TEMPLATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao criar a lista a partir do modelo.' });
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

// --- Atualizar uma Lista (Protegido - Dono) ---
export const updateGiftList = async (req, res) => {
  const { slug } = req.params;
  const { title, description, eventDate } = req.body;
  const userId = req.userId;

  if (!title) {
    return res.status(400).json({ message: 'O título é obrigatório.' });
  }

  try {
    // 1. Garante que o usuário é o dono ANTES de atualizar
    const list = await prisma.giftList.findUnique({
      where: { slug: slug },
    });
    if (!list) {
      return res.status(404).json({ message: 'Lista não encontrada.' });
    }
    if (list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 2. Atualiza a lista
    const updatedList = await prisma.giftList.update({
      where: { slug: slug },
      data: {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    });

    // --- SUGESTÃO: Emitir evento de atualização ---
    const io = getIO();
    io.to(slug).emit('giftlist:updated', updatedList);
    // --- FIM DA SUGESTÃO ---

    res.status(200).json(updatedList);
  } catch (error) {
    console.error('[GIFT_LIST_UPDATE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar a lista.' });
  }
};

// --- FUNÇÃO QUE FALTAVA ---
// --- Deletar uma Lista (Protegido - Dono) ---
export const deleteGiftList = async (req, res) => {
  const { slug } = req.params;
  const userId = req.userId;

  try {
    // 1. Garante que o usuário é o dono ANTES de deletar
    const list = await prisma.giftList.findUnique({
      where: { slug: slug },
    });
    if (!list) {
      return res.status(404).json({ message: 'Lista não encontrada.' });
    }
    if (list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 2. Deleta a lista
    // O 'onDelete: Cascade' no schema.prisma cuidará de deletar
    // as categorias e itens relacionados.
    await prisma.giftList.delete({
      where: { slug: slug },
    });

    res.status(204).send(); // OK, Sem conteúdo
  } catch (error) {
    console.error('[GIFT_LIST_DELETE] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao deletar a lista.' });
  }
};