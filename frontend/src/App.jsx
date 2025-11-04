import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      {/* Todas as rotas dentro de 'Layout' terão a Navbar */}
      <Route path="/" element={<Layout />}>
        {/* A rota principal (index) será a HomePage */}
        <Route index element={<HomePage />} />
        
        {/* Outras páginas */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* TODO: Adicionar rotas protegidas (ex: /dashboard) */}
      </Route>
    </Routes>
  );
}

export default App;
