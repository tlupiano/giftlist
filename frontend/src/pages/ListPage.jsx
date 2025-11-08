import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import ProgressBar from '../components/ProgressBar';
import { useSocket } from '../context/SocketContext.jsx'; // <-- SUGESTÃO 3

// --- Componente Modal de Reserva (sem mudanças) ---
function ReservationModal({ item, onClose, onSubmit, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    await onSubmit(name, email); 
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Reservar Item</h2>
        <p className="mb-4">Você está reservando: <span className="font-semibold">{item.name}</span></p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="purchaserName" className="block text-sm font-medium text-gray-700">Seu nome*</label>
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
            <label htmlFor="purchaserEmail" className="block text-sm font-medium text-gray-700">Seu email (Opcional)</label>
            <input
              type="email"
              id="purchaserEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Componente de Card de Item (ALTERADO) ---
function ItemCard({ item, onReserveClick }) {
  const { status } = item;
  let buttonContent;
  let isDisabled = false;
  let bgColor = 'bg-white';
  let opacity = 'opacity-100';

  switch (status) {
    case 'RESERVED':
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

  const placeholderText = encodeURIComponent(item.name);
  const placeholderImg = `https://placehold.co/600x400/eeeeee/cccccc?text=${placeholderText}`;
  const itemImg = item.imageUrl || placeholderImg;

  return (
    <div className={`border rounded-lg shadow-md overflow-hidden flex flex-col ${bgColor} ${opacity}`}>
      <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
        <img 
          src={itemImg} 
          alt={item.name} 
          className="w-full h-full object-contain"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }} 
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        {/* --- CORREÇÃO 2: Formatação de Preço --- */}
        {item.price > 0 && (
          <p className="text-lg font-bold text-green-700 my-1">
            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
        <p className="text-sm text-gray-600 mt-2 flex-grow">{item.description || 'Nenhuma descrição.'}</p>
        {item.linkUrl && (
          <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2">
            Ver na loja
          </a>
        )}
        <div className="mt-4">
          <button
            onClick={() => onReserveClick(item)}
            disabled={isDisabled}
            className={`w-full py-2 px-4 font-medium rounded-md shadow-sm text-sm ${status === 'AVAILABLE' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''} ${status === 'RESERVED' ? 'bg-yellow-300 text-yellow-900 cursor-not-allowed' : ''} ${status === 'PURCHASED' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : ''}`}
          >
            {buttonContent}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Componente da Página Principal (ATUALIZADO) ---
export default function ListPage() {
  const { slug } = useParams(); 
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalItem, setModalItem] = useState(null);
  const [modalError, setModalError] = useState(null);

  const [totalItems, setTotalItems] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState(0);

  // --- SUGESTÃO 3: Usar o Socket ---
  const socket = useSocket();

  // Função para calcular o progresso
  const calculateProgress = (categories) => {
    let total = 0;
    let purchased = 0;
    if (categories) {
      categories.forEach(c => {
        total += c.items.length;
        purchased += c.items.filter(i => i.status === 'PURCHASED').length;
      });
    }
    setTotalItems(total);
    setPurchasedItems(purchased);
  };

  // Busca inicial da lista
  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/lists/${slug}`);
      setList(data);
      calculateProgress(data.categories); // Calcula o progresso inicial
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar lista:", err);
      setError(err.message || 'Erro ao carregar a lista.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchList();
  }, [slug]);

  // --- SUGESTÃO 3: Substituir o Polling por Socket.io ---
  useEffect(() => {
    if (!socket || !slug) return;

    // 1. Entra na "sala" da lista
    socket.emit('joinListRoom', slug);

    // 2. Ouve por atualizações de itens
    const handleItemUpdate = (updatedItem) => {
      console.log('[SOCKET] Item atualizado recebido:', updatedItem);
      
      setList((prevList) => {
        if (!prevList) return null;
        
        // Atualiza o item no estado da lista
        const newCategories = prevList.categories.map(c => ({
          ...c,
          items: c.items.map(i => i.id === updatedItem.id ? updatedItem : i)
        }));
        
        // Recalcula o progresso
        calculateProgress(newCategories);
        
        return { ...prevList, categories: newCategories };
      });
    };
    
    // 3. Ouve por deleção de itens
    const handleItemDelete = ({ id: deletedItemId, categoryId }) => {
      console.log('[SOCKET] Item deletado recebido:', deletedItemId);
      setList((prevList) => {
        if (!prevList) return null;

        const newCategories = prevList.categories.map(c => {
          if (c.id === categoryId) {
            return {
              ...c,
              items: c.items.filter(i => i.id !== deletedItemId)
            };
          }
          return c;
        });

        calculateProgress(newCategories);
        return { ...prevList, categories: newCategories };
      });
    };
    
    // 4. Ouve por criação de itens
    const handleItemCreated = (newItem) => {
      console.log('[SOCKET] Item criado recebido:', newItem);
      setList((prevList) => {
        if (!prevList) return null;
        const newCategories = prevList.categories.map(c => {
          if (c.id === newItem.categoryId) {
            // Adiciona o novo item à categoria correta
            return { ...c, items: [...c.items, newItem] };
          }
          return c;
        });
        calculateProgress(newCategories);
        return { ...prevList, categories: newCategories };
      });
    };

    // --- CORREÇÃO 3: Adiciona listener para categoria deletada ---
    const handleCategoryDelete = ({ id: deletedCategoryId }) => {
      console.log('[SOCKET] Categoria deletada recebida:', deletedCategoryId);
      setList((prevList) => {
        if (!prevList) return null;

        const newCategories = prevList.categories.filter(c => c.id !== deletedCategoryId);
        
        calculateProgress(newCategories); // Recalcula o progresso
        return { ...prevList, categories: newCategories };
      });
    };
    // --- FIM DA CORREÇÃO ---

    socket.on('item:created', handleItemCreated);
    socket.on('item:updated', handleItemUpdate);
    socket.on('item:deleted', handleItemDelete); 
    socket.on('category:deleted', handleCategoryDelete); // <-- CORREÇÃO 3

    // 5. Limpa ao sair
    return () => {
      socket.emit('leaveListRoom', slug);
      socket.off('item:created', handleItemCreated);
      socket.off('item:updated', handleItemUpdate);
      socket.off('item:deleted', handleItemDelete);
      socket.off('category:deleted', handleCategoryDelete); // <-- CORREÇÃO 3
    };
  }, [socket, slug]); // Roda quando o socket ou o slug mudam
  // --- FIM DA SUGESTÃO 3 ---


  const handleReserveClick = (item) => {
    setModalError(null);
    setModalItem(item);
  };

  const handleConfirmReservation = async (purchaserName, purchaserEmail) => {
    if (!modalItem) return;
    setModalError(null);
    try {
      // O backend agora vai emitir o evento 'item:updated'
      // O listener do socket nesta página vai capturar e atualizar o estado.
      await apiFetch(`/items/${modalItem.id}/reserve`, {
        method: 'PATCH',
        body: JSON.stringify({ purchaserName, purchaserEmail }),
      });
      
      // Não precisamos mais atualizar o estado manualmente aqui
      
      setModalItem(null);
      
    } catch (err) {
      console.error('Erro ao reservar item:', err);
      setModalError(err.data?.message || 'Não foi possível reservar o item.');
    }
  };

  if (loading) {
    return <p className="text-center text-xl mt-10">Carregando lista...</p>;
  }
  if (error) {
    return <p className="text-center text-xl text-red-600 mt-10">{error}</p>;
  }
  if (!list) {
    return <p className="text-center text-xl mt-10">Lista não encontrada.</p>;
  }

  const categoriesWithItems = list ? list.categories.filter(c => c.items.length > 0) : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{list.title}</h1>
        <p className="text-lg text-gray-600">Criada por {list.user.name}</p>
        {list.description && (
          <p className="text-gray-700 mt-4 max-w-2xl mx-auto">{list.description}</p>
        )}
      </div>

      <ProgressBar total={totalItems} comprados={purchasedItems} />

      {list.categories.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Nenhum item foi adicionado a esta lista ainda.</p>
        </div>
      ) : categoriesWithItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Nenhum item foi adicionado a esta lista ainda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categoriesWithItems.map(category => {
            // --- ALTERAÇÃO 2: Cálculo da contagem ---
            const totalCategoryItems = category.items.length;
            const purchasedCategoryItems = category.items.filter(i => i.status === 'PURCHASED').length;

            return (
              <div key={category.id}>
                {/* --- ALTERAÇÃO 2 & 3: Mostrar contagem e ícone --- */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    {category.icon && <span className="text-2xl">{category.icon}</span>}
                    <span>{category.name}</span>
                  </h2>
                  {totalCategoryItems > 0 && (
                    <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      {purchasedCategoryItems}/{totalCategoryItems}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onReserveClick={handleReserveClick} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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