import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

// --- IMPORTAÇÃO NOVA ---
import ListPage from './pages/ListPage'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        {/* === Rotas Públicas === */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* --- ROTA PÚBLICA NOVA --- */}
        {/* Esta rota captura a URL (ex: /lista/cha-da-ana) */}
        <Route path="lista/:slug" element={<ListPage />} /> 

        {/* === Rotas Protegidas === */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
        
      </Route>
    </Routes>
  );
}

export default App;
