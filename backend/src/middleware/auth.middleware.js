import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1. Pega o token do cabeçalho 'Authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  // 2. O token vem no formato "Bearer <token>", pegamos só o token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token mal formatado.' });
  }

  try {
    // 3. Verifica se o token é válido usando nossa chave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Se for válido, anexa o ID do usuário na requisição (req)
    //    Lembre-se que salvamos { userId: user.id } no payload
    req.userId = payload.userId;

    // 5. Deixa a requisição continuar
    next();
  } catch (error) {
    // Se o token for inválido, expirado, etc.
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
