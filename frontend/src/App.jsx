import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Carregando...');
  
  // Efeito para buscar a mensagem da nossa API (backend)
  useEffect(() => {
    // Acessa a API que está em http://localhost:5000
    // Usamos 'fetch' para fazer a requisição
    fetch('http://localhost:5000/')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => {
        console.error("Erro ao buscar dados do backend:", error);
        setMessage("Erro ao conectar com a API. Verifique o console.");
      });
  }, []); // O array vazio [] faz com que isso rode apenas uma vez

  return (
    <div className="container">
      <h1>Plataforma de Lista de Presentes</h1>
      <p>
        Status da API (Backend): <strong>{message}</strong>
      </p>
    </div>
  )
}

export default App
