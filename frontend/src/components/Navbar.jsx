import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800">
          GiftList
        </Link>
        <div className="flex items-center space-x-4">
          
          {isAuthenticated ? (
            // Se ESTIVER logado
            <>
              <span className="text-gray-700 hidden sm:inline">
                Olá, <span className="font-medium">{user.name}</span>
              </span>
              
              {/* --- LINK NOVO AQUI --- */}
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Meu Painel
              </Link>
              
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Sair
              </button>
            </>
          ) : (
            // Se NÃO ESTIVER logado
            <>
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Login
              </Link>
              <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Registrar
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
