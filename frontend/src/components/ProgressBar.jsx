import React from 'react';

/**
 * Mostra uma barra de progresso.
 * @param {object} props
 * @param {number} props.total - O número total de itens.
 * @param {number} props.comprados - O número de itens comprados (status PURCHASED).
 */
export default function ProgressBar({ total, comprados }) {
  // Evita divisão por zero
  const percentual = total > 0 ? (comprados / total) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-gray-700">Progresso</span>
        <span className="text-xl font-bold text-blue-600">
          {Math.round(percentual)}%
        </span>
      </div>
      {/* Barra de Progresso */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentual}%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-gray-600 mt-2">
        {comprados} de {total} itens recebidos
      </p>
    </div>
  );
}
