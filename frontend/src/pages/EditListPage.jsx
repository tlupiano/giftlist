import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import imageCompression from 'browser-image-compression';
import CategoryManagerModal from '../components/CategoryManagerModal';
import { useSocket } from '../context/SocketContext.jsx'; // <-- SUGESTÃO 3

// --- Componentes de Ícone ---
function EditIcon() { /* ... (código do ícone, não removido) ... */ 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}
function DeleteIcon() { /* ... (código do ícone, não removido) ... */ 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
    </svg>
  );
}
function CopyIcon() { /* ... (código do ícone, não removido) ... */ 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.467-7.48-8.467-4.237 0-7.48 4.007-7.48 8.467v7.5c0 .621.504 1.125 1.125 1.125h3.375m9.375-3.375c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125h-9.75A1.125 1.125 0 0 0 9 6.375v9.375c0 .621.504 1.125 1.125 1.125h9.75Z" />
    </svg>
  );
}
function UploadIcon() { /* ... (código do ícone, não removido) ... */ 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}
// --- SUGESTÃO 2: Ícone de Agradecimento ---
function ThankYouIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
// --- FIM DOS ÍCONES ---


// --- Componente de Card de Item (Admin) ---
// --- SUGESTÃO 2: Adicionada prop onThank ---
function AdminItemCard({ item, onConfirm, onCancel, onDelete, onEdit, onThank }) {
  const { status, purchaserName, purchaserEmail } = item; // <-- purchaserEmail adicionado
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
      
      // --- SUGESTÃO 2: Botão de Agradecer ---
      if (purchaserEmail && purchaserName) {
        actions = (
          <div className="flex space-x-2 mt-3">
            <button 
              onClick={() => onThank(item.id)} 
              className="text-xs font-medium bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 flex items-center space-x-1"
            >
              <ThankYouIcon />
              <span>Agradecer</span>
            </button>
          </div>
        );
      }
      // --- FIM DA SUGESTÃO 2 ---
      break;
    default: // AVAILABLE
      bgColor = 'bg-white';
      statusText = <span className="block text-sm font-semibold text-green-700">Disponível</span>;
      break;
  }
  
  const placeholderText = encodeURIComponent(item.name);
  const placeholderImg = `https://placehold.co/100x100/eeeeee/cccccc?text=${placeholderText}`;
  
  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${bgColor}`}>
      <div className="p-4 flex space-x-4">
        {/* Imagem do Item */}
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
          <img 
            src={item.imageUrl || placeholderImg} 
            alt={item.name} 
            className="w-full h-full object-contain rounded-md" // Correção 'object-contain'
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
  const socket = useSocket(); // <-- SUGESTÃO 3
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '', price: '', linkUrl: '', imageUrl: '', description: '', categoryId: '',
  });
  const [formError, setFormError] = useState(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState({ id: null, name: '' });
  const [copyButtonText, setCopyButtonText] = useState('Copiar Link');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editListValues, setEditListValues] = useState({ title: '', description: '', eventDate: '' });
  const [editListError, setEditListError] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [isEditingHighlight, setIsEditingHighlight] = useState(false);
  const editBoxRef = useRef(null);
  
  // --- SUGESTÃO 2: Estado para feedback de e-mail ---
  const [thankYouMessage, setThankYouMessage] = useState(null);

  // Regex para validação de nomes
  const nameValidationRegex = "^[a-zA-Z0-9áéíóúâêîôûàèìòùãõäëïöüçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜÇ '-]+$";


  // --- Funções Principais (fetch, etc) ---

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
      calculateProgress(data.categories);
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

  // --- SUGESTÃO 3: Substituir o Polling por Socket.io ---
  useEffect(() => {
    if (!socket || !slug) return;

    // 1. Entra na "sala" da lista
    socket.emit('joinListRoom', slug);

    // 2. Ouve por atualizações de itens
    const handleItemUpdate = (updatedItem) => {
      console.log('[SOCKET] Item atualizado recebido (Admin):', updatedItem);
      
      setList((prevList) => {
        if (!prevList) return null;
        
        const newCategories = prevList.categories.map(c => ({
          ...c,
          items: c.items.map(i => i.id === updatedItem.id ? updatedItem : i)
        }));
        
        calculateProgress(newCategories);
        return { ...prevList, categories: newCategories };
      });
    };
    
    // 3. Ouve por criação de itens
    const handleItemCreated = (newItem) => {
      console.log('[SOCKET] Item criado recebido (Admin):', newItem);
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

    // 4. Ouve por deleção de itens
    const handleItemDelete = ({ id: deletedItemId, categoryId }) => {
      console.log('[SOCKET] Item deletado recebido (Admin):', deletedItemId);
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


    socket.on('item:created', handleItemCreated);
    socket.on('item:updated', handleItemUpdate);
    socket.on('item:deleted', handleItemDelete); 

    // 5. Limpa ao sair
    return () => {
      socket.emit('leaveListRoom', slug);
      socket.off('item:created', handleItemCreated);
      socket.off('item:updated', handleItemUpdate);
      socket.off('item:deleted', handleItemDelete);
    };
  }, [socket, slug]);
  // --- FIM DA SUGESTÃO 3 ---

  /* O Polling antigo foi REMOVIDO
  useEffect(() => {
    if (!list) {
      return; 
    }
    const intervalId = setInterval(() => {
      console.log("[Polling] Verificando atualizações silenciosamente...");
      fetchList(true); // Esta lógica de 'isSilent' foi removida
    }, 30000); 

    return () => clearInterval(intervalId);
  }, [list, slug]); 
  */

  // --- Funções de Categoria ---
  const updateListState = (updaterFn) => {
    setList(updaterFn);
  };
  
  const handleStartEditCategory = (category) => setEditingCategory({ id: category.id, name: category.name });
  const handleCancelEditCategory = () => setEditingCategory({ id: null, name: '' });

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.id || !editingCategory.name) return;
    
    const nameExists = list.categories.some(
      c => c.name.toLowerCase() === editingCategory.name.toLowerCase() && c.id !== editingCategory.id
    );
    if (nameExists) {
      alert('Esta categoria já existe na sua lista.');
      return;
    }
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
    setIsUploading(false);
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
      // O backend vai emitir 'item:created'
      await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify({ ...formValues, price: priceValue }),
      });
      // Não precisamos mais atualizar o estado manualmente, o socket faz isso.
      resetForm();
    } catch (err) {
      setFormError(err.data?.message || err.message || 'Erro ao adicionar item.');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const priceValue = formValues.price ? parseFloat(formValues.price) : null;
      // O backend vai emitir 'item:updated'
      await apiFetch(`/items/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...formValues, price: priceValue }),
      });
      // Não precisamos mais atualizar o estado manualmente, o socket faz isso.
      resetForm();
    } catch (err) {
      setFormError(err.data?.message || err.message || 'Erro ao atualizar item.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Tem certeza que quer deletar este item?')) return;
    try {
      // O backend vai emitir 'item:deleted'
      await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
      // Não precisamos mais atualizar o estado manualmente, o socket faz isso.
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
    
    // Animação de "piscar"
    setIsEditingHighlight(true);
    setTimeout(() => setIsEditingHighlight(false), 1000); 
    // Scroll suave para o box de edição
    editBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  
  // --- Funções de Moderação ---
  // (Mantemos a atualização otimista da UI, embora o socket também vá atualizar)
  const updateItemInState = (updatedItem) => {
    setList((prevList) => {
        if (!prevList) return null;
        const newCategories = prevList.categories.map(c => ({
          ...c,
          items: c.items.map(i => i.id === updatedItem.id ? updatedItem : i)
        }));
        calculateProgress(newCategories);
        return { ...prevList, categories: newCategories };
      });
  };

  const handleConfirmPurchase = async (itemId) => {
    try {
      // O backend vai emitir 'item:updated'
      const updatedItem = await apiFetch(`/items/${itemId}/confirm`, { method: 'PATCH' });
      updateItemInState(updatedItem); // Atualização otimista
    } catch (err) {
      alert('Não foi possível confirmar a compra.');
    }
  };
  
  const handleCancelReservation = async (itemId) => {
    if (!window.confirm('Cancelar esta reserva? O item ficará disponível.')) return;
    try {
      // O backend vai emitir 'item:updated'
      const updatedItem = await apiFetch(`/items/${itemId}/cancel`, { method: 'PATCH' });
      updateItemInState(updatedItem); // Atualização otimista
    } catch (err) {
      alert('Não foi possível cancelar a reserva.');
    }
  };

  // --- SUGESTÃO 2: Handler de Agradecimento ---
  const handleThankYou = async (itemId) => {
    setThankYouMessage(null);
    try {
      await apiFetch(`/email/thank/${itemId}`, {
        method: 'POST',
      });
      // Mostra uma mensagem de sucesso temporária
      setThankYouMessage('E-mail de agradecimento enviado!');
      setTimeout(() => setThankYouMessage(null), 3000);
    } catch (err) {
      alert('Não foi possível enviar o e-mail: ' + (err.data?.message || err.message));
    }
  };
  
  // --- Funções de UI (Progresso, Copiar Link) ---
  const [totalItems, setTotalItems] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState(0);
  // (useEffect que chamava calculateProgress foi removido pois
  // agora calculamos dentro dos listeners do socket e no fetch inicial)

  // Correção "Copiar Link"
  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/lista/${list.slug}`;
    if (!navigator.clipboard) {
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
    
    if (!new RegExp(nameValidationRegex).test(editListValues.title)) {
      setEditListError('O título contém caracteres inválidos.');
      return;
    }

    try {
      const updatedList = await apiFetch(`/lists/${list.slug}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editListValues,
          eventDate: editListValues.eventDate || null,
        }),
      });
      
      setList(prevList => ({
        ...prevList,
        title: updatedList.title,
        description: updatedList.description,
        eventDate: updatedList.eventDate,
      }));
      
      setIsEditModalOpen(false); 
      
    } catch (err) {
      console.error("Erro ao atualizar lista:", err);
      setEditListError(err.data?.message || 'Erro ao salvar alterações.');
    }
  };

  // --- Funções de Upload de Imagem (sem alteração) ---
  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError("Arquivo inválido. Por favor, envie uma imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { 
      setFormError('A imagem original é muito grande (Max 5MB).');
      return;
    }
    
    setIsUploading(true);
    setFormError(null);
    setFormValues(f => ({ ...f, imageUrl: '' })); 

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      
      console.log('Comprimindo imagem...');
      const compressedFile = await imageCompression(file, options);
      
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
  
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  };
  
  // --- Renderização ---
  // Recalcula o 'categoriesWithItems' toda vez que 'list' muda
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
      
      {/* SUGESTÃO 2: Feedback do E-mail Enviado */}
      {thankYouMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <span className="block sm:inline">{thankYouMessage}</span>
        </div>
      )}

      <ProgressBar total={totalItems} comprados={purchasedItems} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna 1: Formulários (Categoria e Itens) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* --- Formulário de Item (ATUALIZADO) --- */}
          <div 
            ref={editBoxRef} 
            className={`bg-white p-6 rounded-lg shadow-md sticky top-6 ${isEditingHighlight ? 'flash-highlight' : ''}`}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? `Editando: ${editingItem.name}` : 'Adicionar Novo Item'}
            </h2>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div>
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
              
              {/* --- Upload de Imagem --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem do Item</label>
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
              
              {(formValues.imageUrl || isUploading) && (
                <div className="my-2">
                  <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    {isUploading ? (
                      <p className="text-gray-500">Carregando...</p>
                    ) : (
                      <img 
                        src={formValues.imageUrl} 
                        alt="Pré-visualização" 
                        className="w-full h-full object-contain rounded-md"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/f8f8f8/cccccc?text=Imagem+Inválida"; }}
                      />
                    )}
                  </div>
                </div>
              )}
              
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
                        maxLength={50}
                        pattern={nameValidationRegex}
                        title="Apenas letras, números, acentos, espaços, hífens e apóstrofos."
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
                        onThank={handleThankYou} // <-- SUGESTÃO 2
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
                  maxLength={100}
                  pattern={nameValidationRegex}
                  title="Apenas letras, números, acentos, espaços, hífens e apóstrofos."
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
      
      {/* Renderiza o novo modal de categorias */}
      {list && (
        <CategoryManagerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          list={list}
          onUpdateList={updateListState} // Passa a função de callback
        />
      )}
    </>
  );
}