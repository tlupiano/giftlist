import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// --- Componente de Ícone (Lápis para Editar) ---
function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

// --- Componente de Card de Item (Versão do Dono) ---
function AdminItemCard({ item, onConfirm, onCancel, onDelete, onEdit }) { // <-- 1. Adicionado onEdit
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
          {/* --- 2. Botões de Edição/Deleção --- */}
          <div className="flex space-x-3">
            {status === 'AVAILABLE' && ( // Só pode editar se estiver disponível
              <button
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:text-blue-800"
                title="Editar item"
              >
                <EditIcon />
              </button>
            )}
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-500 hover:text-red-700"
              title="Deletar item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
              </svg>
            </button>
          </div>
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
  const { user } = useAuth();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 3. Estado de Edição ---
  const [editingItem, setEditingItem] = useState(null); // Guarda o item sendo editado

  // Estados para o formulário (agora controlam Adicionar e Editar)
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [formError, setFormError] = useState(null);

  // --- Função para buscar os dados da lista ---
  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/lists/${slug}`);
      
      // Verificação de segurança (corrigida na v24)
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

  // --- 4. Função para Limpar/Resetar o Formulário ---
  const resetForm = () => {
    setItemName('');
    setItemPrice('');
    setItemLink('');
    setItemImage('');
    setItemDesc('');
    setFormError(null);
    setEditingItem(null); // Sai do modo de edição
  };

  // --- 5. Funções de Gerenciamento de Itens ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Decide se deve Criar (POST) ou Atualizar (PUT)
    if (editingItem) {
      handleUpdateItem();
    } else {
      handleCreateItem();
    }
  };

  const handleCreateItem = async () => {
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
      resetForm(); // Limpa o formulário

    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setFormError(err.data?.message || 'Erro ao adicionar item.');
    }
  };

  // --- 6. NOVA Função de Atualização de Item ---
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const priceValue = itemPrice ? parseFloat(itemPrice) : null;
      
      const updatedItem = await apiFetch(`/items/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: itemName,
          price: priceValue,
          linkUrl: itemLink,
          imageUrl: itemImage,
          description: itemDesc,
        }),
      });

      // Atualiza o item na lista local
      setList((prevList) => ({
        ...prevList,
        items: prevList.items.map(item =>
          item.id === editingItem.id ? updatedItem : item
        ),
      }));
      resetForm(); // Limpa o formulário e sai do modo de edição

    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setFormError(err.data?.message || 'Erro ao atualizar item.');
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

  // --- 7. NOVA Função para Iniciar a Edição ---
  const handleStartEdit = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.price ? String(item.price) : '');
    setItemLink(item.linkUrl || '');
    setItemImage(item.imageUrl || '');
    setItemDesc(item.description || '');
    setFormError(null);
    // Leva o usuário de volta ao topo para ver o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    resetForm();
  };

  // --- Funções de Moderação de Reserva ---
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
          rel="noopener noreferrer"
          className="py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          Ver Página Pública
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna 1: Adicionar/Editar Itens */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            {/* --- 8. Lógica de Título e Botões --- */}
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? `Editando: ${editingItem.name}` : 'Adicionar Novo Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              
              <div className="space-y-2">
                <button 
                  type="submit" 
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${editingItem ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} 
                    focus:outline-none`}
                >
                  {editingItem ? 'Salvar Alterações' : 'Adicionar Item'}
                </button>
                {editingItem && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>
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
                    onEdit={handleStartEdit} // <-- 9. Passa a função para o card
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

