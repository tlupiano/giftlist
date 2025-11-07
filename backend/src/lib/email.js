import nodemailer from 'nodemailer';

// 1. Configura o "transportador" de e-mail usando as variáveis de ambiente
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: (process.env.EMAIL_PORT === '465'), // true para 465, false para outros ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Função genérica para enviar e-mails
 * @param {string} to - E-mail do destinatário
 * @param {string} subject - Assunto do e-mail
 * @param {string} text - Corpo do e-mail em texto puro
 * @param {string} html - Corpo do e-mail em HTML
 */
export const sendEmail = async (to, subject, text, html) => {
  // Verifica se o e-mail está configurado no .env antes de tentar enviar
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Variáveis de E-mail (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) não definidas no .env. Pulando envio de e-mail.');
    // Retorna (sem erro) para não quebrar a aplicação se o e-mail não estiver configurado
    return; 
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Remetente
      to: to, // Destinatário
      subject: subject, // Assunto
      text: text, // Corpo em texto
      html: html, // Corpo em HTML
    });

    console.log(`[EMAIL] E-mail enviado: ${info.messageId}`);
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar e-mail:', error);
    // Não lançamos um erro para o usuário, apenas logamos no servidor.
  }
};