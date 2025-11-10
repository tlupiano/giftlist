import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

// Aponta para o seu servidor backend
const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conecta ao backend
    // A conexão é estabelecida, mas só entraremos em "salas"
    // nas páginas específicas (ListPage e EditListPage)
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Limpa a conexão ao desmontar
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};