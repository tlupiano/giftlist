import React, { useEffect, useState } from 'react';

/**
 * Componente de notificação Toast.
 * @param {object} props
 * @param {string} props.message - A mensagem a ser exibida.
 * @param {'success' | 'error'} props.type - O tipo de toast (controla a cor).
 * @param {function} props.onClose - Função chamada para fechar o toast.
 */
export default function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Controla a animação de fade-in e fade-out
  useEffect(() => {
    if (message) {
      // 1. Fade-in
      setIsVisible(true);

      // 2. Timer para desaparecer
      const timer = setTimeout(() => {
        setIsVisible(false);
        // 3. Espera a animação de fade-out (300ms) antes de remover
        setTimeout(onClose, 300);
      }, 3000); // Toast desaparece após 3 segundos

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  // Define a cor com base no tipo
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div 
      className={`toast-notification ${isVisible ? 'show' : ''} ${bgColor}`}
    >
      <p className="text-white font-medium">{message}</p>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }} 
        className="ml-4 text-white hover:text-gray-200"
      >
        &times;
      </button>
    </div>
  );
}