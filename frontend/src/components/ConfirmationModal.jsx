import React from 'react';

// Ícone de Alerta para ações destrutivas
function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

/**
 * Um modal genérico para confirmações.
 * @param {object} props
 * @param {boolean} props.isOpen - Se o modal está visível.
 * @param {function} props.onClose - Função para fechar o modal (Cancelar).
 * @param {function} props.onConfirm - Função a ser executada ao confirmar.
 * @param {string} props.title - O título do modal.
 * @param {string} props.message - A mensagem de corpo.
 * @param {string} [props.confirmText="Confirmar"] - O texto do botão de confirmação.
 * @param {'red' | 'blue'} [props.confirmColor="red"] - A cor do botão de confirmação.
 */
export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  confirmColor = "red" 
}) {
  if (!isOpen) {
    return null;
  }

  // Define as classes de cor do botão
  const colorClasses = confirmColor === 'red' 
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  return (
    // Backdrop - Z-index mais alto (z-50) para sobrepor outros modais (que usam z-40)
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" 
      onClick={onClose}
    >
      {/* Modal Content - Z-index mais alto (z-60) */}
      <div 
        className="bg-white p-6 rounded-lg shadow-xl z-60 max-w-sm w-full mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Ícone */}
          {confirmColor === 'red' && (
            <div className="mb-4">
              <WarningIcon />
            </div>
          )}
          
          {/* Título */}
          <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
          
          {/* Mensagem */}
          <p className="text-gray-600 mb-6">{message}</p>
          
          {/* Botões */}
          <div className="flex justify-center space-x-4 w-full">
            <button 
              type="button" 
              onClick={onClose} 
              className="py-2 px-4 w-full border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`py-2 px-4 w-full border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colorClasses} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}