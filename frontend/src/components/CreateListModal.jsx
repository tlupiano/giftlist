import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

/**
 * Um modal para criar uma nova lista.
 * Pode ser usado para criar uma lista em branco ou a partir de um template.
 * * @param {object} props
 * @param {string} [props.templateId] - O ID do template (se estiver criando a partir de um)
 * @param {string} [props.templateName] - O nome do template (para o título)
 * @param {function} props.onClose - Função para fechar o modal
 * @param {function} props.onListCreated - Função chamada com a nova lista após o sucesso
 */
export default function CreateListModal({ templateId, templateName, onClose, onListCreated }) {
  // Estados para o formulário
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define o título do modal
  const modalTitle = templateName 
    ? `Criar a partir de "${templateName}"`
    : 'Criar Nova Lista em Branco';

  // --- Função para criar a lista ---
  const handleCreateList = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setFormError('URL (Slug) deve conter apenas letras minúsculas, números e hífens.');
      setIsSubmitting(false);
      return;
    }

    // Define o endpoint e o corpo da requisição
    // com base na presença do templateId
    const isFromTemplate = !!templateId;
    const endpoint = isFromTemplate ? '/lists/from-template' : '/lists';
    
    const body = { 
      title, 
      slug, 
      description,
      eventDate: eventDate || null,
    };
    if (isFromTemplate) {
      body.templateId = templateId; // Adiciona o ID do template
    }

    try {
      const newList = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // Sucesso!
      onListCreated(newList); // Informa o Dashboard sobre a nova lista
      onClose(); // Fecha o modal
      
    } catch (err) {
      console.error(err);
      setFormError(err.data.message || 'Erro ao criar a lista.');
      setIsSubmitting(false);
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
  
  // Define o título inicial se for um template
  useEffect(() => {
    if (templateName) {
      setTitle(`Minha ${templateName}`);
      handleTitleChange({ target: { value: `Minha ${templateName}` } });
    }
  }, [templateName]); // Roda só uma vez quando o modal abre com um templateName

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div 
        className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-lg w-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{modalTitle}</h2>
        
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
              placeholder={templateId ? "Uma mensagem para seus convidados..." : ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar Lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}