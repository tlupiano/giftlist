import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  // Pegamos o 'user' do contexto para personalizar a página
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">Painel de Controle</h1>
      <p className="text-lg text-gray-700">
        Bem-vindo de volta, <span className="font-semibold">{user.name}</span>!
      </p>
      <p className="mt-2 text-gray-600">
        Este é o seu painel pessoal. Em breve, você poderá criar e gerenciar suas listas de presentes aqui.
      </p>
    </div>
  );
}
