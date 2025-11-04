import prisma from '../lib/prisma.js'; // Nosso cliente Prisma
import bcrypt from 'bcryptjs'; // Para criptografar senhas
import jwt from 'jsonwebtoken'; // Para criar tokens

// --- REGISTRO DE NOVO USUÁRIO ---
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  // 1. Validação básica
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, senha e nome são obrigatórios.' });
  }

  try {
    // 2. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10); // 10 "rounds" de salt

    // 3. Salvar usuário no banco
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    console.log(`[AUTH] Usuário criado: ${newUser.email}`);
    // Não retornamos a senha, mesmo hasheada
    res.status(201).json({ message: 'Usuário criado com sucesso!' });

  } catch (error) {
    // 4. Lidar com erros
    // P2002 é o código do Prisma para "violação de restrição única" (email já existe)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Este email já está em uso.' });
    }
    
    console.error('[AUTH_REGISTER] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao tentar registrar usuário.' });
  }
};


// --- LOGIN DE USUÁRIO ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validação básica
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    // 2. Encontrar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Se o usuário não existe
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Msg genérica
    }

    // 3. Comparar a senha enviada com a senha hasheada no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Se a senha estiver incorreta
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Msg genérica
    }

    // 4. Gerar o Token JWT
    const token = jwt.sign(
      { userId: user.id }, // O "payload" do token (o que queremos salvar)
      process.env.JWT_SECRET, // A chave secreta do .env
      { expiresIn: '1d' } // Token expira em 1 dia
    );

    console.log(`[AUTH] Login com sucesso: ${user.email}`);

    // 5. Enviar o token para o cliente
    // (Mais tarde, vamos configurar cookies, por enquanto enviamos no JSON)
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });

  } catch (error) {
    console.error('[AUTH_LOGIN] Erro:', error);
    res.status(500).json({ message: 'Erro interno ao tentar fazer login.' });
  }
};
