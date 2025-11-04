import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {/* O 'Outlet' é onde as páginas (Home, Login, etc.) serão renderizadas */}
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
