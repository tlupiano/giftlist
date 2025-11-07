import React, { useState } from 'react';
import { apiFetch } from '../utils/api';

// Ícone de Lixeira
function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
    </svg>
  );
}

/**
 * Modal para Gerenciar Categorias (Adicionar, Deletar).
 * @param {object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {function} props.onClose - Função para fechar o modal
 * @param {object} props.list - O objeto da lista (precisamos do ID e das categorias)
 * @param {function} props.onUpdateList - Callback para atualizar a lista na página principal
 */
export default function CategoryManagerModal({ isOpen, onClose, list, onUpdateList }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Regex para validação de nomes (letras, números, acentos, espaço, hífen, apóstrofo)
  const nameValidationRegex = "^[a-zA-Z0-9áéíóúâêîôûàèìòùãõäëïöüçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜÇ '-]+$";

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError(null);
    if (!newCategoryName) return;

    // Validação de duplicidade (do Ponto 2)
    const nameExists = list.categories.some(
      c => c.name.toLowerCase() === newCategoryName.toLowerCase()
    );
    if (nameExists) {
      setCategoryError('Esta categoria já existe na sua lista.');
      return;
    }
    
    // Validação de caracteres (do Ponto 2)
    if (!new RegExp(nameValidationRegex).test(newCategoryName)) {
      setCategoryError('O nome contém caracteres inválidos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCategory = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName, listId: list.id }),
      });
      
      // Atualiza a lista no estado pai
      onUpdateList(prevList => ({
        ...prevList,
        categories: [...prevList.categories, { ...newCategory, items: [] }] 
      }));
      setNewCategoryName('');
      
    } catch (err) {
      setCategoryError(err.data?.message || 'Erro ao criar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Tem certeza? Deletar uma categoria também deletará TODOS os itens dentro dela.')) return;
    
    try {
      await apiFetch(`/categories/${categoryId}`, { method: 'DELETE' });
      // Atualiza a lista no estado pai
      onUpdateList(prevList => ({
        ...prevList,
        categories: prevList.categories.filter(c => c.id !== categoryId)
      }));
    } catch (err) {
      alert('Não foi possível deletar a categoria: ' + (err.data?.message || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div 
        className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-lg w-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Gerenciar Categorias</h2>

        {/* Formulário para Adicionar Categoria */}
        <h3 className="text-lg font-semibold mb-2">Adicionar Nova Categoria</h3>
        <form onSubmit={handleCreateCategory} className="flex space-x-2 mb-4">
          <input 
            type="text" 
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)} 
            placeholder="Ex: Cozinha" 
            required
            maxLength={50} // Limite (Ponto 2)
            pattern={nameValidationRegex} // Validação (Ponto 2)
            title="Apenas letras, números, acentos, espaços, hífens e apóstrofos."
            className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'Criar'}
          </button>
        </form>
        {categoryError && <p className="text-sm text-red-600 mb-4">{categoryError}</p>}

        {/* Lista de Categorias Existentes */}
        <h3 className="text-lg font-semibold mb-2">Categorias Atuais</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {list.categories.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma categoria criada.</p>
          ) : (
            list.categories.map(category => (
              <div key={category.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-800">{category.name}</span>
                {/* TODO: Botões de Mover (Cima/Baixo) podem ser adicionados aqui 
                  quando o backend for atualizado com um campo 'order'.
                */}
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Deletar Categoria"
                >
                  <DeleteIcon />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Botão de Fechar */}
        <div className="flex justify-end mt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}