import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- Importar Link
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Estados para o formulário
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(''); // <-- NOVO CAMPO

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

    if (user) { // Garante que o user existe antes de buscar
      fetchLists();
    }
  }, [user]); // Adiciona user como dependência

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
          eventDate: eventDate || null // Envia a data ou nulo
        }),
      });

      setMyLists([newList, ...myLists]);
      setTitle('');
      setSlug('');
      setDescription('');
      setEventDate(''); // <-- Limpa o campo
      
    } catch (err) {
      console.error(err);
      setFormError(err.data.message || 'Erro ao criar a lista.');
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
      
      {/* Coluna 1: Formulário de Criação */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
          <h2 className="text-2xl font-bold mb-4">Criar Nova Lista</h2>
          <form onSubmit={handleCreateList} className="space-y-4">
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
              {/* --- ERRO CORRIGIDO AQUI --- */}
              <p className="mt-1 text-xs text-gray-500">Ex: cha-da-ana-e-bruno</p>
            </div>
            {/* --- NOVO CAMPO DE DATA --- */}
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

      {/* Coluna 2: Listas Existentes */}
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
                <Link 
                  key={list.id} 
                  to={`/dashboard/lista/${list.slug}`} // <-- Link correto
                  className="block border border-gray-200 p-4 rounded-lg hover:shadow-lg transition-shadow hover:border-blue-400"
                >
                  <h3 className="text-xl font-semibold text-blue-700">{list.title}</h3>
                  <p className="text-sm text-gray-500">/lista/{list.slug}</p>
                  {list.eventDate && (
                    // --- ERRO CORRIGIDO AQUI ---
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      Data: {new Date(list.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  )}
                  <p className="text-gray-700 mt-2">{list.description || 'Nenhuma descrição.'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

