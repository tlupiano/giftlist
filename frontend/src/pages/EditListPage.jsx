import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// --- Componente de Card de Item (Versão do Dono) ---
function AdminItemCard({ item, onConfirm, onCancel, onDelete }) {
  const { status, purchaserName } = item;

  let statusText = '';
  let bgColor = 'bg-white';
  let actions = null;

  switch (status) {
    case 'RESERVED':
      bgColor = 'bg-yellow-50';
      statusText = (
        <span className="block text-sm font-semibold text-yellow-800">
          Reservado por: {purchaserName || 'Desconhecido'}
        </span>
      );
      actions = (
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => onConfirm(item.id)}
            className="text-xs font-medium bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
          >
            Confirmar Compra
          </button>
          <button
            onClick={() => onCancel(item.id)}
            className="text-xs font-medium bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
          >
            Cancelar Reserva
          </button>
        </div>
      );
      break;
    
    case 'PURCHASED':
      bgColor = 'bg-gray-100';
      statusText = (
        <span className="block text-sm font-semibold text-gray-600">
          Comprado (por {purchaserName || 'alguém'})
        </span>
      );
      break;
    
    default: // AVAILABLE
      bgColor = 'bg-white';
      statusText = <span className="block text-sm font-semibold text-green-700">Disponível</span>;
      break;
  }

  return (
    <div className={`border rounded-lg shadow-md overflow-hidden ${bgColor}`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
            {statusText}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Deletar
          </button>
        </div>
        
        {item.price > 0 && (
          <p className="text-md font-bold text-gray-700 my-1">R$ {item.price.toFixed(2)}</p>
        )}
        
        <p className="text-sm text-gray-600 mt-2">{item.description || 'Nenhuma descrição.'}</p>
        
        {/* Ações de Moderação */}
        {actions}
      </div>
    </div>
  );
}

// --- Página Principal de Edição ---
export default function EditListPage() {
  const { slug } = useParams();
  const { user } = useAuth(); // Para garantir
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para o formulário de "Adicionar Item"
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [formError, setFormError] = useState(null);

  // --- Função para buscar os dados da lista ---
  const fetchList = async () => {
    try {
      // Não precisamos recarregar a lista inteira, apenas setar o loading
      // O useEffect já vai buscar
      setLoading(true);
      const data = await apiFetch(`/lists/${slug}`);
      
      if (data.user.id !== user.id) {
         setError('Acesso negado. Esta lista não é sua.');
         setLoading(false);
         return;
      }
      
      setList(data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar lista:", err);
      setError(err.message || 'Erro ao carregar a lista.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) { 
      fetchList();
    }
  }, [slug, user]); 

  // --- Funções de Gerenciamento de Itens ---

  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const priceValue = itemPrice ? parseFloat(itemPrice) : null;

      const newItem = await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify({
          name: itemName,
          price: priceValue,
          linkUrl: itemLink,
          imageUrl: itemImage,
          description: itemDesc,
          listId: list.id,
        }),
      });

      setList((prevList) => ({
        ...prevList,
        items: [...prevList.items, newItem],
      }));
      
      setItemName(''); setItemPrice(''); setItemLink(''); setItemImage(''); setItemDesc('');

    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setFormError(err.data?.message || 'Erro ao adicionar item.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Tem certeza que quer deletar este item?')) return;
    
    try {
      await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
      setList((prevList) => ({
        ...prevList,
        items: prevList.items.filter(item => item.id !== itemId),
      }));
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      alert('Não foi possível deletar o item.');
    }
  };

  // --- NOSSAS NOVAS FUNÇÕES DE MODERAÇÃO ---

  const handleConfirmPurchase = async (itemId) => {
    try {
      const updatedItem = await apiFetch(`/items/${itemId}/confirm`, { method: 'PATCH' });
      setList((prevList) => ({
        ...prevList,
        items: prevList.items.map(item =>
          item.id === itemId ? updatedItem : item
        ),
      }));
    } catch (err) {
      console.error('Erro ao confirmar compra:', err);
      alert('Não foi possível confirmar a compra.');
    }
  };

  const handleCancelReservation = async (itemId) => {
    if (!window.confirm('Tem certeza que quer cancelar esta reserva? O item ficará disponível novamente.')) return;
    
    try {
      const updatedItem = await apiFetch(`/items/${itemId}/cancel`, { method: 'PATCH' });
      setList((prevList) => ({
        ...prevList,
        items: prevList.items.map(item =>
          item.id === itemId ? updatedItem : item
        ),
      }));
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      alert('Não foi possível cancelar a reserva.');
    }
  };


  // --- Renderização ---
  if (loading) {
    return <p className="text-center text-xl mt-10">Carregando gerenciador...</p>;
  }
  if (error) {
    return <p className="text-center text-xl text-red-600 mt-10">{error}</p>;
  }
  if (!list) {
    return <p className="text-center text-xl mt-10">Lista não encontrada.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{list.title}</h1>
          <p className="text-lg text-gray-600">Modo de Gerenciamento</p>
        </div>
        <Link 
          to={`/lista/${list.slug}`} 
          target="_blank"
          rel="noopener noreferrer" // Boa prática para target="_blank"
          className="py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          Ver Página Pública
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna 1: Adicionar Itens */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-2xl font-bold mb-4">Adicionar Novo Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Nome do Item*</label>
                <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">Preço (Ex: 150.00)</label>
                <input type="number" step="0.01" id="itemPrice" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="itemImage" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input type="text" id="itemImage" value={itemImage} onChange={(e) => setItemImage(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="itemLink" className="block text-sm font-medium text-gray-700">Link da Loja</label>
                <input type="text" id="itemLink" value={itemLink} onChange={(e) => setItemLink(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="itemDesc" className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea id="itemDesc" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              
              <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                Adicionar Item
              </button>
            </form>
          </div>
        </div>

        {/* Coluna 2: Itens na Lista */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Itens na Lista</h2>
            {list.items.length === 0 ? (
              <p className="text-gray-600">Nenhum item adicionado ainda.</p>
            ) : (
              <div className="space-y-4">
                {list.items.map((item) => (
                  <AdminItemCard 
                    key={item.id} 
                    item={item} 
                    onConfirm={handleConfirmPurchase}
                    onCancel={handleCancelReservation}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
