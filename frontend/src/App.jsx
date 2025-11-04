import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import ListPage from './pages/ListPage'; // Página pública
import EditListPage from './pages/EditListPage'; // <-- Nossa página de edição

function App() {
  return (
    <Routes>
      {/* Todas as páginas usam o Layout (Navbar) */}
      <Route path="/" element={<Layout />}>
        
        {/* === Rotas Públicas === */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="lista/:slug" element={<ListPage />} /> {/* Rota pública */}

        {/* === Rotas Protegidas === */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          {/* --- Rota de Edição --- */}
          <Route path="dashboard/lista/:slug" element={<EditListPage />} />
        </Route>
        
      </Route>
    </Routes>
  );
}

export default App;
