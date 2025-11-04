import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o Provedor (o componente que vai "segurar" o estado)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Para sabermos se está checando o localStorage
  const navigate = useNavigate();

  // 3. Efeito que roda QUANDO O APP CARREGA
  // Busca dados do localStorage para ver se o usuário já estava logado
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Falha ao carregar dados de autenticação:", error);
      // Limpa em caso de erro (ex: JSON mal formatado)
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false); // Terminou de carregar
    }
  }, []); // Array vazio [] = roda apenas 1 vez

  // 4. Função de Login
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha no login');
      }

      // 5. Sucesso! Salva tudo
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user)); // localStorage só guarda strings

      navigate('/'); // Redireciona para a Home

    } catch (error) {
      // Retorna o erro para o LoginPage poder exibir
      throw error; 
    }
  };

  // 6. Função de Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login'); // Envia para a página de login
  };

  // 7. O "valor" que o provedor vai compartilhar com os filhos
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user, // Um booleano simples: está logado? (true/false)
    loading,
  };

  // 8. Retorna o Provedor com o valor
  // Não renderiza nada até terminar de checar o localStorage
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 9. Hook customizado (para facilitar nossa vida)
// Em vez de importar useContext e AuthContext, só importamos useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
