import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx' // 1. Importa o Provedor
import { SocketProvider } from './context/SocketContext.jsx'; // <-- SUGESTÃO 3

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. Envolve o App com o AuthProvider */}
      <AuthProvider>
        {/* 3. Envolve o App com o SocketProvider */}
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)