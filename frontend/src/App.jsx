import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// 1. Importar nossos novos componentes
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Todas as páginas usam o Layout (Navbar) */}
      <Route path="/" element={<Layout />}>
        
        {/* === Rotas Públicas === */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* === Rotas Protegidas === */}
        {/* 2. Criamos um "grupo" de rotas que usa o ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          {/* 3. Todas as rotas "filhas" aqui dentro são protegidas */}
          <Route path="dashboard" element={<DashboardPage />} />
          {/* (No futuro, podemos adicionar mais: /minhas-listas, /perfil, etc) */}
        </Route>
        
      </Route>
    </Routes>
  );
}

export default App;
