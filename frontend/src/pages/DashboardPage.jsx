import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api.js';

// --- Ícone de Lixeira ---
function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Estados para o formulário
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(''); 

  // Estados para a lista
  const [myLists, setMyLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // --- Efeito para buscar as listas ---
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoading(true);
        const lists = await apiFetch('/lists'); // GET /api/lists
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

  // --- Função para criar a lista ---
  const handleCreateList = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setFormError('URL (Slug) deve conter apenas letras minúsculas, números e hífens.');
      return;
    }

    try {
      const newList = await apiFetch('/lists', {
        method: 'POST',
        body: JSON.stringify({ 
          title, 
          slug, 
          description,
          eventDate: eventDate || null 
        }),
      });

      setMyLists([newList, ...myLists]);
      setTitle('');
      setSlug('');
      setDescription('');
      setEventDate(''); 
      
    } catch (err) {
      console.error(err);
      setFormError(err.data.message || 'Erro ao criar a lista.');
    }
  };

  // --- NOVO: Função para DELETAR a lista ---
  const handleDeleteList = async (listSlug) => {
    if (!window.confirm('Tem certeza que quer deletar esta lista? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await apiFetch(`/lists/${listSlug}`, {
        method: 'DELETE',
      });
      // Atualiza o estado removendo a lista deletada
      setMyLists(myLists.filter(list => list.slug !== listSlug));
    } catch (err) {
      console.error(err);
      alert(err.data?.message || 'Não foi possível deletar a lista.');
    }
  };
  
  // Atualiza o slug automaticamente baseado no título
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const newSlug = newTitle
      .toLowerCase()
      .normalize("NFD") // Remove acentos
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-'); // Troca espaços por hífens
    setSlug(newSlug);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Coluna 1: Formulário de Criação (sem mudanças) */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
          <h2 className="text-2xl font-bold mb-4">Criar Nova Lista</h2>
          <form onSubmit={handleCreateList} className="space-y-4">
            {/* ... (campos do formulário) ... */}
             <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título da Lista*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL da Lista (Slug)*
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Ex: cha-da-ana-e-bruno</p>
            </div>
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                Data do Evento (Opcional)
              </label>
              <input
                type="date"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição (Opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Criar Lista
            </button>
          </form>
        </div>
      </div>

      {/* Coluna 2: Listas Existentes (ATUALIZADO) */}
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
                // Card da Lista (UI Melhorada)
                <div 
                  key={list.id} 
                  className="block border border-gray-200 p-4 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {/* Layout responsivo: 'col' em 'xs', 'row' em 'sm' */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    
                    {/* Informações da Lista */}
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
                    
                    {/* Botões de Ação */}
                    <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto">
                      <Link 
                        to={`/dashboard/lista/${list.slug}`}
                        // flex-grow para ocupar espaço em 'xs', sm:flex-grow-0 para normalizar
                        className="p-2 flex-grow sm:flex-grow-0 text-center text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        title="Gerenciar Itens"
                      >
                        Gerenciar
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Impede o clique de ir para o Link
                          handleDeleteList(list.slug);
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
    </div>
  );
}