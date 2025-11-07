import prisma from '../lib/prisma.js';
import { sendEmail } from '../lib/email.js';

// --- Enviar E-mail de Agradecimento (Protegido - Dono) ---
export const sendThankYouEmail = async (req, res) => {
  const { id } = req.params; // ID do Item
  const userId = req.userId;

  try {
    // 1. Encontrar o item e verificar a posse (dono da lista)
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            list: {
              include: {
                user: true // Puxa o dono da lista
              }
            }
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    if (item.category.list.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não é o dono desta lista.' });
    }

    // 2. Verificar se o item foi comprado e se há um e-mail
    if (item.status !== 'PURCHASED') {
      return res.status(400).json({ message: 'Este item ainda não foi marcado como comprado.' });
    }
    if (!item.purchaserEmail || !item.purchaserName) {
      return res.status(400).json({ message: 'O comprador não forneceu nome ou e-mail para contato.' });
    }

    // 3. Preparar e enviar o e-mail
    const listOwnerName = item.category.list.user.name;
    const listTitle = item.category.list.title;
    const itemName = item.name;

    const subject = `Obrigado pelo seu presente: ${itemName}!`;
    const text = `
      Olá, ${item.purchaserName}!
      
      Muito obrigado por comprar o item "${itemName}" da minha lista "${listTitle}".
      
      Abraços,
      ${listOwnerName}
    `;
    const html = `
      <p>Olá, <strong>${item.purchaserName}</strong>!</p>
      <p>Muito obrigado por comprar o item "<strong>${itemName}</strong>" da minha lista "<strong>${listTitle}</strong>".</p>
      <br>
      <p>Abraços,<br>${listOwnerName}</p>
    `;

    // Chama a função de envio (não bloqueia a resposta ao usuário)
    // O await aqui é opcional, mas é bom para garantir que a função foi chamada
    // antes de responder ao usuário. O envio real é assíncrono.
    sendEmail(item.purchaserEmail, subject, text, html);

    res.status(202).json({ message: 'E-mail de agradecimento enviado para a fila.' });

  } catch (error) {
    console.error('[EMAIL_THANKYOU] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao enviar o agradecimento.' });
  }
};