import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api.js';
import CreateListModal from '../components/CreateListModal';
import ConfirmationModal from '../components/ConfirmationModal'; // <-- Importa o modal elegante

// --- Ícones ---
function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
    </svg>
  );
}
function IconBaby() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A1.875 1.875 0 0 1 18 22.5H6A1.875 1.875 0 0 1 4.501 20.118Z" />
    </svg>
  );
}
function IconRing() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}
function IconPlus() {
   return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
// Mapeamento de ícones
const iconMap = {
  baby: <IconBaby />,
  ring: <IconRing />,
};


export default function DashboardPage() {
  const { user } = useAuth();

  const [myLists, setMyLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // --- Estado para o modal de confirmação ---
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmar',
    confirmColor: 'red',
  });

  // --- Efeito para buscar as LISTAS do usuário ---
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoading(true);
        const lists = await apiFetch('/lists'); 
        setMyLists(lists);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erro ao buscar suas listas.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchLists();
    }
  }, [user]);

  // --- Efeito para buscar os TEMPLATES ---
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const data = await apiFetch('/templates'); 
        setTemplates(data);
      } catch (err) {
        console.error("Erro ao buscar templates:", err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []); 

  // --- Funções de Abertura do Modal ---
  const handleOpenManualModal = () => {
    setSelectedTemplate(null);
    setModalOpen(true);
  };
  const handleOpenTemplateModal = (template) => {
    setSelectedTemplate(template);
    setModalOpen(true);
  };

  // --- Função callback para quando o modal cria a lista ---
  const handleListCreated = (newList) => {
    setMyLists([newList, ...myLists]);
  };
  
  // --- Funções para DELETAR a lista (atualizadas) ---
  const handleCloseConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  // Esta é a função que o botão "Deletar" chama
  const promptDeleteList = (listSlug, listTitle) => {
    setConfirmModal({
      isOpen: true,
      title: 'Deletar Lista',
      message: `Tem certeza que quer deletar a lista "${listTitle}"? Esta ação não pode ser desfeita.`,
      // Define a ação de confirmação
      onConfirm: () => executeDeleteList(listSlug), 
      confirmText: 'Deletar',
      confirmColor: 'red'
    });
  };

  // Esta é a lógica de deleção que o modal executa
  const executeDeleteList = async (listSlug) => {
    try {
      await apiFetch(`/lists/${listSlug}`, {
        method: 'DELETE',
      });
      setMyLists(myLists.filter(list => list.slug !== listSlug));
      // Não precisa de toast aqui, a lista some (feedback visual)
    } catch (err) {
      console.error(err);
      alert(err.data?.message || 'Não foi possível deletar a lista.');
    } finally {
      handleCloseConfirm(); // Fecha o modal de confirmação
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Coluna 1: Templates de Criação (sem mudança) */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
          <h2 className="text-2xl font-bold mb-4">Criar Nova Lista</h2>
          <p className="text-gray-600 mb-6">Comece usando um de nossos modelos populares ou crie uma lista do zero.</p>
          
          <div className="space-y-4">
            {/* Botões dos Templates */}
            {loadingTemplates && <p>Carregando modelos...</p>}
            
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleOpenTemplateModal(template)}
                className="w-full flex items-center space-x-4 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all"
              >
                <span className="text-blue-600">
                  {iconMap[template.icon] || <IconPlus />}
                </span>
                <div>
                  <span className="font-semibold text-lg text-gray-800">{template.name}</span>
                  <p className="text-sm text-gray-500 text-left">{template.description}</p>
                </div>
              </button>
            ))}

            {/* Botão de Lista em Branco */}
            <button
              onClick={handleOpenManualModal}
              className="w-full flex items-center space-x-4 p-4 border border-dashed border-gray-400 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <span className="text-gray-600">
                <IconPlus />
              </span>
              <div>
                <span className="font-semibold text-lg text-gray-800">Lista em Branco</span>
                <p className="text-sm text-gray-500 text-left">Comece do zero e adicione suas próprias categorias.</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Coluna 2: Listas Existentes (botão de deletar atualizado) */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Minhas Listas</h1>
          
          {loading && <p>Carregando suas listas...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && myLists.length === 0 && (
            <p className="text-gray-600">
              Você ainda não tem nenhuma lista. Crie sua primeira lista ao lado!
            </p>
          )}

          {!loading && myLists.length > 0 && (
            <div className="space-y-4">
              {myLists.map((list) => (
                <div 
                  key={list.id} 
                  className="block border border-gray-200 p-4 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-blue-700 hover:underline">
                        <Link to={`/dashboard/lista/${list.slug}`}>
                          {list.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">/lista/{list.slug}</p>
                      {list.eventDate && (
                        <p className="text-sm text-gray-600 font-medium mt-1">
                          Data: {new Date(list.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </p>
                      )}
                      <p className="text-gray-700 mt-2">{list.description || 'Nenhuma descrição.'}</p>
                    </div>
                    
                    <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto">
                      <Link 
                        to={`/dashboard/lista/${list.slug}`}
                        className="p-2 flex-grow sm:flex-grow-0 text-center text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        title="Gerenciar Itens"
                      >
                        Gerenciar
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          promptDeleteList(list.slug, list.title); // <--- MUDANÇA AQUI
                        }}
                        className="p-2 flex-shrink-0 text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                        title="Deletar Lista"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Renderização Condicional do Modal de Criação */}
      {modalOpen && (
        <CreateListModal
          templateId={selectedTemplate?.id}
          templateName={selectedTemplate?.name}
          onClose={() => setModalOpen(false)}
          onListCreated={handleListCreated}
        />
      )}

      {/* Renderiza o novo modal de confirmação */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
      />
    </div>
  );
}