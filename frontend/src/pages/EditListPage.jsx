import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import imageCompression from 'browser-image-compression';
// --- CORREÇÃO (Ponto 1) ---
// Importar o novo modal de gerenciamento de categoria
import CategoryManagerModal from '../components/CategoryManagerModal';
// --- FIM DA CORREÇÃO ---

// --- Componentes de Ícone ---
function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}
function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.467-7.48-8.467-4.237 0-7.48 4.007-7.48 8.467v7.5c0 .621.504 1.125 1.125 1.125h3.375m9.375-3.375c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125h-9.75A1.125 1.125 0 0 0 9 6.375v9.375c0 .621.504 1.125 1.125 1.125h9.75Z" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}
// --- Fim dos Ícones ---


// --- Componente de Card de Item (Admin) ---
function AdminItemCard({ item, onConfirm, onCancel, onDelete, onEdit }) {
  const { status, purchaserName } = item;
  let statusText = '';
  let bgColor = 'bg-white';
  let actions = null;

  switch (status) {
    case 'RESERVED':
      bgColor = 'bg-yellow-50';
      statusText = <span className="block text-sm font-semibold text-yellow-800">Reservado por: {purchaserName || 'Desconhecido'}</span>;
      actions = (
        <div className="flex space-x-2 mt-3">
          <button onClick={() => onConfirm(item.id)} className="text-xs font-medium bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">Confirmar</button>
          <button onClick={() => onCancel(item.id)} className="text-xs font-medium bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600">Cancelar</button>
        </div>
      );
      break;
    case 'PURCHASED':
      bgColor = 'bg-gray-100';
      statusText = <span className="block text-sm font-semibold text-gray-600">Comprado (por {purchaserName || 'alguém'})</span>;
      break;
    default: // AVAILABLE
      bgColor = 'bg-white';
      statusText = <span className="block text-sm font-semibold text-green-700">Disponível</span>;
      break;
  }
  
  const placeholderText = encodeURIComponent(item.name);
  const placeholderImg = `https://placehold.co/100x100/eeeeee/cccccc?text=${placeholderText}`;
  
  // 3. Correção Imagem Cortada: Usa 'object-contain'
  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${bgColor}`}>
      <div className="p-4 flex space-x-4">
        {/* Imagem do Item */}
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
          <img 
            src={item.imageUrl || placeholderImg} 
            alt={item.name} 
            className="w-full h-full object-contain rounded-md" // <-- MUDANÇA AQUI
            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
          />
        </div>
        
        {/* Detalhes do Item */}
        <div className="flex-grow">
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
                <DeleteIcon />
              </button>
            </div>
          </div>
          {item.price > 0 && (
            <p className="text-md font-bold text-gray-700 my-1">R$ {item.price.toFixed(2)}</p>
          )}
          {actions}
        </div>
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

  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '', price: '', linkUrl: '', imageUrl: '', description: '', categoryId: '',
  });
  const [formError, setFormError] = useState(null);

  // --- CORREÇÃO (Ponto 1) ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  // --- FIM DA CORREÇÃO ---
  
  const [editingCategory, setEditingCategory] = useState({ id: null, name: '' });
  const [copyButtonText, setCopyButtonText] = useState('Copiar Link');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editListValues, setEditListValues] = useState({ title: '', description: '', eventDate: '' });
  const [editListError, setEditListError] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // --- CORREÇÃO (Ponto 4 e 5) ---
  const [isEditingHighlight, setIsEditingHighlight] = useState(false);
  const editBoxRef = useRef(null);
  // --- FIM DA CORREÇÃO ---
  
  // --- CORREÇÃO (Ponto 2) ---
  // Regex para validação de nomes (letras, números, acentos, espaço, hífen, apóstrofo)
  const nameValidationRegex = "^[a-zA-Z0-9áéíóúâêîôûàèìòùãõäëïöüçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜÇ '-]+$";
  // --- FIM DA CORREÇÃO ---


  // --- Funções Principais (fetch, etc) ---
  const fetchList = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true); 
      const data = await apiFetch(`/lists/${slug}`); 
      if (!user || data.user.id !== user.id) {
         setError('Acesso negado. Esta lista não é sua.');
         if (!isSilent) setLoading(false);
         return;
      }
      setList(data);
      setEditListValues({
        title: data.title,
        description: data.description || '',
        eventDate: data.eventDate ? data.eventDate.split('T')[0] : '',
      });
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar lista:", err);
      if (!isSilent || !list) setError(err.message || 'Erro ao carregar a lista.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchList(false);
  }, [slug, user]); 

  useEffect(() => {
    if (!list) return; 
    const intervalId = setInterval(() => {
      console.log("[Polling] Verificando atualizações silenciosamente...");
      fetchList(true); 
    }, 30000); 
    return () => clearInterval(intervalId);
  }, [list, slug]); 

  // --- CORREÇÃO (Ponto 1) ---
  // Callback para o modal de categoria atualizar o estado da lista
  const updateListState = (updaterFn) => {
    setList(updaterFn);
  };
  // --- FIM DA CORREÇÃO ---
  
  // Funções de Edição de Nome (permanecem aqui, pois ocorrem na lista principal)
  const handleStartEditCategory = (category) => setEditingCategory({ id: category.id, name: category.name });
  const handleCancelEditCategory = () => setEditingCategory({ id: null, name: '' });

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.id || !editingCategory.name) return;
    
    // Correção Categoria Duplicada (Ponto 2)
    const nameExists = list.categories.some(
      c => c.name.toLowerCase() === editingCategory.name.toLowerCase() && c.id !== editingCategory.id
    );
    if (nameExists) {
      alert('Esta categoria já existe na sua lista.');
      return;
    }
    // Validação de caracteres (Ponto 2)
    if (!new RegExp(nameValidationRegex).test(editingCategory.name)) {
      alert('O nome da categoria contém caracteres inválidos.');
      return;
    }
    
    try {
      const updatedCategory = await apiFetch(`/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingCategory.name }),
      });
      setList(prevList => ({
        ...prevList,
        categories: prevList.categories.map(c => 
          c.id === updatedCategory.id ? { ...c, name: updatedCategory.name } : c
        )
      }));
      handleCancelEditCategory();
    } catch (err) {
      alert('Não foi possível renomear a categoria.');
    }
  };

  // --- Funções de Item ---
  const resetForm = () => {
    setFormValues({ name: '', price: '', linkUrl: '', imageUrl: '', description: '', categoryId: '' });
    setFormError(null);
    setEditingItem(null);
    setIsUploading(false); // Reseta o estado de upload
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    setFormError(null);
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
      const newItem = await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify({ ...formValues, price: priceValue }),
      });
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
      // --- CORREÇÃO (Ponto 3) ---
      // Captura o erro 413 formatado pelo api.js
      setFormError(err.data?.message || err.message || 'Erro ao adicionar item.');
      // --- FIM DA CORREÇÃO ---
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
      setList(prevList => {
        const newCategories = prevList.categories.map(c => {
          if (c.id === editingItem.categoryId && c.id !== updatedItem.categoryId) {
            return { ...c, items: c.items.filter(i => i.id !== editingItem.id) };
          }
          if (c.id === updatedItem.categoryId) {
            const itemExists = c.items.find(i => i.id === updatedItem.id);
            if (itemExists) {
              return { ...c, items: c.items.map(i => i.id === updatedItem.id ? updatedItem : i) };
            } else {
              return { ...c, items: [...c.items, updatedItem] };
            }
          }
          return c;
        });
        return { ...prevList, categories: newCategories };
      });
      resetForm();
    } catch (err) {
      // --- CORREÇÃO (Ponto 3) ---
      setFormError(err.data?.message || err.message || 'Erro ao atualizar item.');
      // --- FIM DA CORREÇÃO ---
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Tem certeza que quer deletar este item?')) return;
    try {
      await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
      setList(prevList => ({
        ...prevList,
        categories: prevList.categories.map(c => ({
          ...c,
          items: c.items.filter(i => i.id !== itemId)
        }))
      }));
    } catch (err) {
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
      categoryId: item.categoryId,
    });
    setFormError(null);
    
    // --- CORREÇÃO (Ponto 5) ---
    // Removemos o scroll para o topo
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    // --- FIM DA CORREÇÃO ---

    // --- CORREÇÃO (Ponto 4) ---
    // Ativa o "pisca"
    setIsEditingHighlight(true);
    // Remove a classe de highlight após a animação (1s)
    setTimeout(() => setIsEditingHighlight(false), 1000); 

    // Scroll suave para o box de edição (Melhoria do Ponto 5)
    editBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // --- FIM DA CORREÇÃO ---
  };
  
  // --- Funções de Moderação (sem mudança) ---
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
  
  // --- Funções de UI (Progresso, Copiar Link) ---
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
  }, [list]); 

  // Correção "Copiar Link"
  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/lista/${list.slug}`;
    
    if (!navigator.clipboard) {
      console.error('API de Clipboard não suportada.');
      setCopyButtonText('Falhou!');
      return;
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyButtonText('Copiado!');
      setTimeout(() => setCopyButtonText('Copiar Link'), 2000);
    } catch (err) {
      console.error('Falha ao copiar link: ', err);
      setCopyButtonText('Falhou!');
    }
  };
  
  // --- Funções do Modal de Edição da Lista ---
  const handleOpenEditModal = () => {
    if (!list) return;
    setEditListValues({
      title: list.title,
      description: list.description || '',
      eventDate: list.eventDate ? list.eventDate.split('T')[0] : '',
    });
    setEditListError(null);
    setIsEditModalOpen(true);
  };
  
  const handleUpdateListDetails = async (e) => {
    e.preventDefault();
    setEditListError(null);
    
    // --- CORREÇÃO (Ponto 2) ---
    if (!new RegExp(nameValidationRegex).test(editListValues.title)) {
      setEditListError('O título contém caracteres inválidos.');
      return;
    }
    // --- FIM DA CORREÇÃO ---

    try {
      const updatedList = await apiFetch(`/lists/${list.slug}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editListValues,
          eventDate: editListValues.eventDate || null,
        }),
      });
      
      // Atualiza a lista no estado
      setList(prevList => ({
        ...prevList,
        title: updatedList.title,
        description: updatedList.description,
        eventDate: updatedList.eventDate,
      }));
      
      setIsEditModalOpen(false); // Fecha o modal
      
    } catch (err) {
      console.error("Erro ao atualizar lista:", err);
      setEditListError(err.data?.message || 'Erro ao salvar alterações.');
    }
  };

  // --- Funções de Upload de Imagem ---
  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError("Arquivo inválido. Por favor, envie uma imagem.");
      return;
    }
    
    // --- CORREÇÃO (Ponto 3) ---
    // Pré-validação do tamanho (ex: 5MB) para evitar processamento desnecessário
    // O limite do backend será 5mb, mas o da compressão é 1mb.
    if (file.size > 5 * 1024 * 1024) { 
      setFormError('A imagem original é muito grande (Max 5MB).');
      return;
    }
    // --- FIM DA CORREÇÃO ---
    
    setIsUploading(true);
    setFormError(null);
    setFormValues(f => ({ ...f, imageUrl: '' })); // Limpa URL antiga

    try {
      // Opções de compressão
      const options = {
        maxSizeMB: 1,          // Tamanho máximo (1MB)
        maxWidthOrHeight: 1024, // Redimensiona para 1024px
        useWebWorker: true,
      };
      
      console.log('Comprimindo imagem...');
      const compressedFile = await imageCompression(file, options);
      
      // Converte para Base64 (data:URL)
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result;
        setFormValues(f => ({ ...f, imageUrl: base64data }));
        setIsUploading(false);
      };
      reader.onerror = (error) => {
        console.error("Erro ao ler arquivo:", error);
        setFormError("Erro ao processar a imagem.");
        setIsUploading(false);
      };

    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      setFormError("Não foi possível comprimir a imagem.");
      setIsUploading(false);
    }
  };
  
  // Handlers do Drag-and-Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageFile(file);
    }
  };
  // Handler do input de arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };
  
  // --- Renderização ---
  const categoriesWithItems = list ? list.categories.filter(c => c.items.length > 0) : [];

  if (loading) return <p className="text-center text-xl mt-10">Carregando gerenciador...</p>;
  if (error) return <p className="text-center text-xl text-red-600 mt-10">{error}</p>;
  if (!list) return <p className="text-center text-xl mt-10">Lista não encontrada.</p>;

  return (
    <>
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{list.title}</h1>
            <p className="text-lg text-gray-600">Modo de Gerenciamento</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleOpenEditModal} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Editar Lista
            </button>
            <button onClick={handleCopyLink} className="flex items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              <CopyIcon />
              <span>{copyButtonText}</span>
            </button>
            <Link to={`/lista/${list.slug}`} target="_blank" rel="noopener noreferrer" className="py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50">
              Ver Página Pública
            </Link>
          </div>
        </div>
      </div>
      
      <ProgressBar total={totalItems} comprados={purchasedItems} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna 1: Formulários (Categoria e Itens) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* --- CORREÇÃO (Ponto 1) --- */}
          {/* O box de "Adicionar Categoria" foi removido daqui. */}
          {/* --- FIM DA CORREÇÃO --- */}


          {/* --- Formulário de Item (ATUALIZADO) --- */}
          <div 
            // --- CORREÇÃO (Ponto 4) ---
            ref={editBoxRef} // Ref para o scroll
            className={`bg-white p-6 rounded-lg shadow-md sticky top-6 ${isEditingHighlight ? 'flash-highlight' : ''}`}
            // --- FIM DA CORREÇÃO ---
          >
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? `Editando: ${editingItem.name}` : 'Adicionar Novo Item'}
            </h2>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div>
                {/* --- CORREÇÃO (Ponto 1) --- */}
                {/* Botão de Gerenciar Categoria ao lado do label */}
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria*</label>
                  <button 
                    type="button" 
                    onClick={() => setIsCategoryModalOpen(true)} 
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Gerenciar
                  </button>
                </div>
                {/* --- FIM DA CORREÇÃO --- */}
                <select id="category" value={formValues.categoryId} onChange={(e) => setFormValues(f => ({ ...f, categoryId: e.target.value }))} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
              
              {/* --- 1. Upload de Imagem --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem do Item</label>
                {/* Drag-and-Drop Area */}
                <input 
                  type="file" 
                  id="fileUpload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="fileUpload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer
                    ${dragOver ? 'border-blue-500 bg-blue-50' : ''}
                    ${isUploading ? 'bg-gray-100 cursor-wait' : ''}`}
                >
                  <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-8 w-8 text-gray-400" />
                    {isUploading ? (
                      <p className="text-sm text-gray-600">Processando imagem...</p>
                    ) : (
                      <div className="flex text-sm text-gray-600">
                        <p>Arraste e solte ou <span className="text-blue-600 font-medium">clique aqui</span></p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (max 5MB)</p>
                  </div>
                </label>
                
                {/* Input de URL */}
                <div className="mt-2">
                  <label htmlFor="itemImage" className="block text-xs font-medium text-gray-600">Ou cole a URL da Imagem</label>
                  <input 
                    type="text" 
                    id="itemImage" 
                    value={formValues.imageUrl} 
                    onChange={(e) => setFormValues(f => ({ ...f, imageUrl: e.target.value }))} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    placeholder="https://..."
                    disabled={isUploading}
                  />
                </div>
              </div>
              
              {/* Pré-visualização da Imagem */}
              {(formValues.imageUrl || isUploading) && (
                <div className="my-2">
                  <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    {isUploading ? (
                      <p className="text-gray-500">Carregando...</p>
                    ) : (
                      <img 
                        src={formValues.imageUrl} 
                        alt="Pré-visualização" 
                        // 3. Correção Imagem Cortada
                        className="w-full h-full object-contain rounded-md" // <-- MUDANÇA AQUI
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/f8f8f8/cccccc?text=Imagem+Inválida"; }}
                      />
                    )}
                  </div>
                </div>
              )}
              {/* --- Fim do Upload de Imagem --- */}
              
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
                <button type
                  ="submit" 
                  disabled={isUploading}
                  className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white 
                    ${editingItem ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                    ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isUploading ? 'Aguarde...' : (editingItem ? 'Salvar Alterações' : 'Adicionar Item')}
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
              <p className="text-gray-600">Nenhuma categoria criada ainda. Clique em "Gerenciar" acima para criar sua primeira categoria.</p>
            </div>
          ) : categoriesWithItems.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">Suas categorias estão vazias. Adicione itens a elas usando o formulário ao lado para que elas apareçam aqui.</p>
            </div>
          ) : (
            categoriesWithItems.map(category => (
              <div key={category.id} className="bg-white p-6 rounded-lg shadow-md">
                
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  {editingCategory.id === category.id ? (
                    <form onSubmit={handleUpdateCategory} className="flex-grow flex items-center space-x-2">
                      <input 
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory(c => ({ ...c, name: e.target.value }))}
                        className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        autoFocus
                        // --- CORREÇÃO (Ponto 2) ---
                        maxLength={50}
                        pattern={nameValidationRegex}
                        title="Apenas letras, números, acentos, espaços, hífens e apóstrofos."
                        // --- FIM DA CORREÇÃO ---
                      />
                      <button type="submit" className="text-green-600 hover:text-green-800 p-1">Salvar</button>
                      <button type="button" onClick={handleCancelEditCategory} className="text-gray-500 hover:text-gray-700 p-1">Cancelar</button>
                    </form>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <button 
                        onClick={() => handleStartEditCategory(category)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Renomear Categoria"
                      >
                        <EditIcon />
                      </button>
                    </div>
                  )}
                  
                  {/* O botão de deletar categoria foi movido para o modal (Ponto 1) */}
                  {/* {editingCategory.id !== category.id && (
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                      title="Deletar Categoria"
                    >
                      <DeleteIcon />
                      <span>Deletar</span>
                    </button>
                  )}
                  */}
                </div>
                
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
      
      {/* Modal de Edição da Lista */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Editar Detalhes da Lista</h2>
            <form onSubmit={handleUpdateListDetails} className="space-y-4">
              <div>
                <label htmlFor="listTitle" className="block text-sm font-medium text-gray-700">Título*</label>
                <input
                  type="text"
                  id="listTitle"
                  value={editListValues.title}
                  onChange={(e) => setEditListValues(v => ({ ...v, title: e.target.value }))}
                  required
                  // --- CORREÇÃO (Ponto 2) ---
                  maxLength={100}
                  pattern={nameValidationRegex}
                  title="Apenas letras, números, acentos, espaços, hífens e apóstrofos."
                  // --- FIM DA CORREÇÃO ---
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="listEventDate" className="block text-sm font-medium text-gray-700">Data do Evento</label>
                <input
                  type="date"
                  id="listEventDate"
                  value={editListValues.eventDate}
                  onChange={(e) => setEditListValues(v => ({ ...v, eventDate: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="listDescription" className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  id="listDescription"
                  value={editListValues.description}
                  onChange={(e) => setEditListValues(v => ({ ...v, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              {editListError && <p className="text-sm text-red-600">{editListError}</p>}
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* --- CORREÇÃO (Ponto 1) --- */}
      {/* Renderiza o novo modal de categorias (somente se a lista estiver carregada) */}
      {list && (
        <CategoryManagerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          list={list}
          onUpdateList={updateListState} // Passa a função de callback
        />
      )}
      {/* --- FIM DA CORREÇÃO --- */}
    </>
  );
}