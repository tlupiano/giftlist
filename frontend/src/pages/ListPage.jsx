import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';

// --- NOVO: Componente Modal de Reserva ---
// (Colocamos aqui para manter o arquivo único)
function ReservationModal({ item, onClose, onSubmit, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Opcional
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return; // Validação simples
    
    setIsSubmitting(true);
    await onSubmit(name, email);
    // O 'onClose' só será chamado pelo componente pai se der certo
    setIsSubmitting(false);
  };

  return (
    // Overlay (fundo escuro)
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      onClick={onClose} // Fecha ao clicar fora
    >
      {/* Conteúdo do Modal */}
      <div 
        className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // Impede de fechar ao clicar dentro
      >
        <h2 className="text-xl font-bold mb-4">Reservar Item</h2>
        <p className="mb-4">Você está reservando: <span className="font-semibold">{item.name}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="purchaserName" className="block text-sm font-medium text-gray-700">
              Seu nome*
            </label>
            <input
              type="text"
              id="purchaserName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="purchaserEmail" className="block text-sm font-medium text-gray-700">
              Seu email (Opcional)
            </label>
            <input
              type="email"
              id="purchaserEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Usado para o dono da lista saber quem é você.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- Componente de Card de Item (Atualizado) ---
function ItemCard({ item, onReserveClick }) {
  const { status } = item; // <-- MUDANÇA: Não precisamos mais do 'purchaserName' aqui

  let buttonContent;
  let isDisabled = false;
  let bgColor = 'bg-white';
  let opacity = 'opacity-100';

  switch (status) {
    case 'RESERVED':
      // --- MUDANÇA AQUI ---
      // Agora mostra apenas "Item Reservado" para privacidade
      buttonContent = 'Item Reservado';
      isDisabled = true;
      bgColor = 'bg-yellow-50';
      opacity = 'opacity-80';
      break;
    case 'PURCHASED':
      buttonContent = 'Item já comprado!';
      isDisabled = true;
      bgColor = 'bg-gray-100';
      opacity = 'opacity-70';
      break;
    default: // AVAILABLE
      buttonContent = 'Quero dar este! (Reservar)';
      isDisabled = false;
  }

  return (
    <div 
      className={`border rounded-lg shadow-md overflow-hidden flex flex-col ${bgColor} ${opacity}`}
    >
      {/* Imagem */}
      {item.imageUrl ? (
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/eeeeee/cccccc?text=Imagem+Indisponível"; }}
        />
      ) : (
        <img 
          src="https://placehold.co/600x400/eeeeee/cccccc?text=Sem+Imagem" 
          alt={item.name} 
          className="w-full h-48 object-cover"
        />
      )}
      
      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        
        {item.price > 0 && (
          <p className="text-lg font-bold text-green-700 my-1">R$ {item.price.toFixed(2)}</p>
        )}
        
        <p className="text-sm text-gray-600 mt-2 flex-grow">{item.description || 'Nenhuma descrição.'}</p>
        
        {item.linkUrl && (
          <a 
            href={item.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Ver na loja
          </a>
        )}

        {/* Botão (Atualizado) */}
        <div className="mt-4">
          <button
            onClick={() => onReserveClick(item)} // <-- Chama a função para abrir o modal
            disabled={isDisabled}
            className={`w-full py-2 px-4 font-medium rounded-md shadow-sm text-sm
              ${status === 'AVAILABLE' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              ${status === 'RESERVED' ? 'bg-yellow-300 text-yellow-900 cursor-not-allowed' : ''}
              ${status === 'PURCHASED' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : ''}
            `}
          >
            {buttonContent}
          </button>
        </div>
      </div>
    </div>
  );
}


// --- Componente da Página Principal (Atualizado) ---
export default function ListPage() {
  const { slug } = useParams(); 
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Estados para o Modal ---
  const [modalItem, setModalItem] = useState(null); // O item selecionado para o modal
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/lists/${slug}`);
        setList(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar lista:", err);
        setError(err.message || 'Erro ao carregar a lista.');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [slug]);

  // --- Função para abrir o modal ---
  const handleReserveClick = (item) => {
    setModalError(null); // Limpa erros antigos
    setModalItem(item);
  };

  // --- Função para lidar com a submissão do modal ---
  const handleConfirmReservation = async (purchaserName, purchaserEmail) => {
    if (!modalItem) return;
    
    setModalError(null); // Limpa o erro do modal

    try {
      // Chama nosso novo endpoint público com os dados do convidado
      const updatedItem = await apiFetch(`/items/${modalItem.id}/reserve`, {
        method: 'PATCH',
        body: JSON.stringify({ purchaserName, purchaserEmail }),
      });

      // Atualiza o estado local da lista
      setList((prevList) => ({
        ...prevList,
        items: prevList.items.map(item =>
          item.id === modalItem.id ? updatedItem : item
        ),
      }));
      
      setModalItem(null); // Fecha o modal com sucesso

    } catch (err) {
      console.error('Erro ao reservar item:', err);
      // Mostra o erro do backend (ex: "Item já foi comprado") no modal
      setModalError(err.data?.message || 'Não foi possível reservar o item.');
    }
  };

  // --- Renderização ---
  if (loading) {
    return <p className="text-center text-xl mt-10">Carregando lista...</p>;
  }
  if (error) {
    return <p className="text-center text-xl text-red-600 mt-10">{error}</p>;
  }
  if (!list) {
    return <p className="text-center text-xl mt-10">Lista não encontrada.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cabeçalho da Lista */}
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{list.title}</h1>
        <p className="text-lg text-gray-600">Criada por {list.user.name}</p>
        {list.description && (
          <p className="text-gray-700 mt-4 max-w-2xl mx-auto">{list.description}</p>
        )}
      </div>

      {/* Seção de Itens */}
      <div className="px-4">
        <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Itens da Lista</h2>
        
        {list.items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Nenhum item foi adicionado a esta lista ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.items.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onReserveClick={handleReserveClick} 
              />
            ))}
          </div>
        )}
      </div>

      {/* --- O Modal (Renderização Condicional) --- */}
      {modalItem && (
        <ReservationModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSubmit={handleConfirmReservation}
          error={modalError}
        />
      )}
    </div>
  );
}
