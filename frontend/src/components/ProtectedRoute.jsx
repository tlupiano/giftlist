import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // 1. Pega os dados de autenticação e o status de 'loading'
  const { isAuthenticated, loading } = useAuth();

  // 2. Se estiver checando o localStorage, mostra um 'carregando'
  // ISSO É MUITO IMPORTANTE: Evita "piscar" a tela de login
  // antes do app saber que o usuário já estava logado.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  // 3. Se não estiver carregando E NÃO estiver autenticado...
  if (!isAuthenticated) {
    // ...redireciona para o login.
    // 'replace' impede o usuário de "voltar" para a pág. protegida
    return <Navigate to="/login" replace />;
  }

  // 4. Se passou por tudo, o usuário está logado.
  // <Outlet /> renderiza o componente "filho" (ex: a DashboardPage)
  return <Outlet />;
}
