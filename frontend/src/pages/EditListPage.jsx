import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar'; // <-- 1. IMPORTAR

// --- Componente de Ícone (Lápis para Editar) ---
// (Movido para dentro da EditListPage para manter o arquivo único por enquanto)
function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

// --- Componente de Card de Item (Admin) ---
// (Sem grandes mudanças, apenas recebe os handlers)
function AdminItemCard({ item, onConfirm, onCancel, onDelete, onEdit }) {
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
          <button onClick={() => onConfirm(item.id)} className="text-xs font-medium bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
            Confirmar
          </button>
          <button onClick={() => onCancel(item.id)} className="text-xs font-medium bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600">
            Cancelar
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
    <div className={`border rounded-lg shadow-sm overflow-hidden ${bgColor}`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-semibold text-gray-800">{item.name}</h3>
            {statusText}
          </div>
          <div className="flex space-x-3 flex-shrink-0">
            {status === 'AVAILABLE' && (
              <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800" title="Editar item">
                <EditIcon />
              </button>
            )}
            <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700" title="Deletar item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
              </svg>
            </button>
          </div>
        </div>
        {item.price > 0 && (
          <p className="text-md font-bold text-gray-700 my-1">R$ {item.price.toFixed(2)}</p>
        )}
        {actions}
      </div>
    </div>
  );
}


// --- Página Principal de Edição (REFATORADA) ---
export default function EditListPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para o formulário de Adicionar/Editar Item
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    price: '',
    linkUrl: '',
    imageUrl: '',
    description: '',
    categoryId: '', // <-- 2. PRECISAMOS DELE NO FORMULÁRIO
  });
  const [formError, setFormError] = useState(null);

  // Estado para o formulário de "Adicionar Categoria"
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState(null);

  // --- 3. Função para buscar os dados da lista (agora com categorias) ---
  const fetchList = async () => {
    try {
      setLoading(true);
      // O controller (v27) já manda os dados com a nova estrutura
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

  // --- 4. Funções de Gerenciamento de CATEGORIA ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError(null);
    if (!newCategoryName) return;

    try {
      const newCategory = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName, listId: list.id }),
      });
      
      // Adiciona a nova categoria (vazia) ao estado
      setList(prevList => ({
        ...prevList,
        categories: [...prevList.categories, { ...newCategory, items: [] }] 
      }));
      setNewCategoryName('');
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      setCategoryError(err.data?.message || 'Erro ao criar categoria.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Tem certeza? Deletar uma categoria também deletará TODOS os itens dentro dela.')) return;

    try {
      await apiFetch(`/categories/${categoryId}`, { method: 'DELETE' });
      // Remove a categoria do estado
      setList(prevList => ({
        ...prevList,
        categories: prevList.categories.filter(c => c.id !== categoryId)
      }));
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      alert('Não foi possível deletar a categoria.');
    }
  };

  // --- 5. Funções de Gerenciamento de ITENS (Atualizadas) ---

  const resetForm = () => {
    setFormValues({ name: '', price: '', linkUrl: '', imageUrl: '', description: '', categoryId: '' });
    setFormError(null);
    setEditingItem(null);
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validação
    if (!formValues.categoryId) {
      setFormError('Você deve selecionar uma categoria.');
      return;
    }

    if (editingItem) {
      handleUpdateItem();
    } else {
      handleCreateItem();
    }
  };

  const handleCreateItem = async () => {
    try {
      const priceValue = formValues.price ? parseFloat(formValues.price) : null;
      
      // Chama a API (o controller v28 já espera categoryId)
      const newItem = await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify({ ...formValues, price: priceValue }),
      });

      // Adiciona o novo item NA CATEGORIA CORRETA no estado
      setList(prevList => ({
        ...prevList,
        categories: prevList.categories.map(c => 
          c.id === formValues.categoryId 
            ? { ...c, items: [...c.items, newItem] } 
            : c
        )
      }));
      resetForm();

    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setFormError(err.data?.message || 'Erro ao adicionar item.');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const priceValue = formValues.price ? parseFloat(formValues.price) : null;
      
      const updatedItem = await apiFetch(`/items/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...formValues, price: priceValue }),
      });

      // Lógica complexa para atualizar o item no estado
      setList(prevList => {
        const newCategories = prevList.categories.map(c => {
          // 1. Remove o item da categoria antiga (se a categoria mudou)
          if (c.id === editingItem.categoryId && c.id !== updatedItem.categoryId) {
            return { ...c, items: c.items.filter(i => i.id !== editingItem.id) };
          }
          // 2. Adiciona/Atualiza o item na categoria nova
          if (c.id === updatedItem.categoryId) {
            const itemExists = c.items.find(i => i.id === updatedItem.id);
            if (itemExists) {
              // Atualiza
              return { ...c, items: c.items.map(i => i.id === updatedItem.id ? updatedItem : i) };
            } else {
              // Adiciona (mudou de categoria)
              return { ...c, items: [...c.items, updatedItem] };
            }
          }
          return c;
        });
        return { ...prevList, categories: newCategories };
      });
      
      resetForm();

    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setFormError(err.data?.message || 'Erro ao atualizar item.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Tem certeza que quer deletar este item?')) return;
    try {
      await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
      // Remove o item de qualquer categoria que ele esteja
      setList(prevList => ({
        ...prevList,
        categories: prevList.categories.map(c => ({
          ...c,
          items: c.items.filter(i => i.id !== itemId)
        }))
      }));
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      alert('Não foi possível deletar o item.');
    }
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setFormValues({
      name: item.name,
      price: item.price ? String(item.price) : '',
      linkUrl: item.linkUrl || '',
      imageUrl: item.imageUrl || '',
      description: item.description || '',
      categoryId: item.categoryId, // <-- Pega o categoryId do item
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Funções de Moderação de Reserva (Sem alteração, mas precisam atualizar o estado aninhado) ---

  const updateItemInState = (updatedItem) => {
    setList(prevList => ({
      ...prevList,
      categories: prevList.categories.map(c => ({
        ...c,
        items: c.items.map(i => i.id === updatedItem.id ? updatedItem : i)
      }))
    }));
  };

  const handleConfirmPurchase = async (itemId) => {
    try {
      const updatedItem = await apiFetch(`/items/${itemId}/confirm`, { method: 'PATCH' });
      updateItemInState(updatedItem);
    } catch (err) {
      alert('Não foi possível confirmar a compra.');
    }
  };

  const handleCancelReservation = async (itemId) => {
    if (!window.confirm('Cancelar esta reserva? O item ficará disponível.')) return;
    try {
      const updatedItem = await apiFetch(`/items/${itemId}/cancel`, { method: 'PATCH' });
      updateItemInState(updatedItem);
    } catch (err) {
      alert('Não foi possível cancelar a reserva.');
    }
  };

  // --- 6. Cálculo da Barra de Progresso ---
  const [totalItems, setTotalItems] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState(0);

  useEffect(() => {
    if (list) {
      let total = 0;
      let purchased = 0;
      list.categories.forEach(c => {
        total += c.items.length;
        purchased += c.items.filter(i => i.status === 'PURCHASED').length;
      });
      setTotalItems(total);
      setPurchasedItems(purchased);
    }
  }, [list]); // Recalcula sempre que a lista mudar


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
    <>
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
      
      {/* --- 7. BARRA DE PROGRESSO --- */}
      <ProgressBar total={totalItems} comprados={purchasedItems} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna 1: Formulários (Categoria e Itens) */}
        <div className="md:col-span-1 space-y-6">
          {/* Formulário de Adicionar Categoria */}
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-bold mb-4">Adicionar Categoria</h2>
            <form onSubmit={handleCreateCategory} className="flex space-x-2">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Cozinha"
                required
                className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800">
                Criar
              </button>
            </form>
            {categoryError && <p className="text-sm text-red-600 mt-2">{categoryError}</p>}
          </div>

          {/* Formulário de Adicionar/Editar Item */}
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-48">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? `Editando: ${editingItem.name}` : 'Adicionar Novo Item'}
            </h2>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              
              {/* --- 8. SELETOR DE CATEGORIA --- */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria*</label>
                <select 
                  id="category" 
                  value={formValues.categoryId} 
                  onChange={(e) => setFormValues(f => ({ ...f, categoryId: e.target.value }))}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {list.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Nome do Item*</label>
                <input type="text" id="itemName" value={formValues.name} onChange={(e) => setFormValues(f => ({ ...f, name: e.target.value }))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">Preço (Ex: 150.00)</label>
                <input type="number" step="0.01" id="itemPrice" value={formValues.price} onChange={(e) => setFormValues(f => ({ ...f, price: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="itemImage" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input type="text" id="itemImage" value={formValues.imageUrl} onChange={(e) => setFormValues(f => ({ ...f, imageUrl: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="itemLink" className="block text-sm font-medium text-gray-700">Link da Loja</label>
                <input type="text" id="itemLink" value={formValues.linkUrl} onChange={(e) => setFormValues(f => ({ ...f, linkUrl: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="itemDesc" className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea id="itemDesc" value={formValues.description} onChange={(e) => setFormValues(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              
              <div className="space-y-2">
                <button type="submit" className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white ${editingItem ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {editingItem ? 'Salvar Alterações' : 'Adicionar Item'}
                </button>
                {editingItem && (
                  <button type="button" onClick={resetForm} className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Coluna 2: Categorias e Itens */}
        <div className="md:col-span-2 space-y-6">
          {list.categories.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">Nenhuma categoria criada ainda. Crie sua primeira categoria no formulário ao lado.</p>
            </div>
          ) : (
            // --- 9. RENDERIZAÇÃO EM GRUPOS ---
            list.categories.map(category => (
              <div key={category.id} className="bg-white p-6 rounded-lg shadow-md">
                {/* Cabeçalho da Categoria */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Deletar Categoria
                  </button>
                </div>
                {/* Itens da Categoria */}
                {category.items.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum item nesta categoria. Adicione um item usando o formulário ao lado.</p>
                ) : (
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <AdminItemCard 
                        key={item.id} 
                        item={item} 
                        onConfirm={handleConfirmPurchase}
                        onCancel={handleCancelReservation}
                        onDelete={handleDeleteItem}
                        onEdit={handleStartEdit}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
