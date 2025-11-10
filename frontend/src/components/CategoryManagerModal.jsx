import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { apiFetch } from '../utils/api';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';

// --- ÍCONES ---
function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0H3.398c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125Z" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  );
}

// --- COMPONENTE DRAGGABLE ---
function DraggableCategory({ category, onDeleteCategory }) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ categoryId: category.id, type: 'category-item' }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) => source.data.type === 'category-item',
        getIsSticky: () => true,
        getData: ({ input, element }) => {
          const data = { categoryId: category.id };
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDragEnter: (args) => setClosestEdge(extractClosestEdge(args.self.data)),
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      })
    );
  }, [category.id]);

  return (
    <div
      ref={ref}
      className={`relative flex justify-between items-center p-3 bg-gray-50 rounded-md ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center space-x-2">
        <DragHandleIcon />
        {category.icon && <span className="text-xl">{category.icon}</span>}
        <span className="text-gray-800">{category.name}</span>
      </div>
      <button
        onClick={() => onDeleteCategory(category.id, category.name)}
        className="text-red-500 hover:text-red-700 p-1"
        title="Deletar Categoria"
      >
        <DeleteIcon />
      </button>
      {closestEdge && <DropIndicator edge={closestEdge} gap="2px" />}
    </div>
  );
}

// --- MODAL PRINCIPAL ---
export default function CategoryManagerModal({
  isOpen,
  onClose,
  list,
  onUpdateList,
  requestConfirmation,
  showToast,
}) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [categoryError, setCategoryError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderedCategories, setOrderedCategories] = useState([]);

  const nameValidationRegex = "^[a-zA-Z0-9áéíóúâêîôûàèìòùãõäëïöüçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜÇ '\\-]+$";

  useEffect(() => {
    if (list?.categories) {
      const sorted = [...list.categories].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
      setOrderedCategories(sorted);
    }
  }, [list]);

  const handleClose = () => {
    setNewCategoryName('');
    setNewCategoryIcon('');
    setCategoryError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError(null);
    if (!newCategoryName) return;

    const nameExists = orderedCategories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase());
    if (nameExists) {
      setCategoryError('Esta categoria já existe na sua lista.');
      return;
    }

    if (!new RegExp(nameValidationRegex).test(newCategoryName)) {
      setCategoryError('O nome contém caracteres inválidos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCategory = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCategoryName,
          icon: newCategoryIcon,
          listId: list.id,
        }),
      });

      const updatedCategories = [...orderedCategories, { ...newCategory, items: [] }];
      setOrderedCategories(updatedCategories);
      onUpdateList(prevList => ({ ...prevList, categories: updatedCategories }));

      setNewCategoryName('');
      setNewCategoryIcon('');
    } catch (err) {
      setCategoryError(err.data?.message || 'Erro ao criar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    const executeDelete = async () => {
      try {
        await apiFetch(`/categories/${categoryId}`, { method: 'DELETE' });
        
        const updatedCategories = orderedCategories.filter(c => c.id !== categoryId);
        setOrderedCategories(updatedCategories);
        onUpdateList(prevList => ({ ...prevList, categories: updatedCategories }));

        showToast({ message: 'Categoria deletada.', type: 'success' });
      } catch (err) {
        showToast({ message: 'Não foi possível deletar: ' + (err.data?.message || err.message), type: 'error' });
      }
    };

    requestConfirmation(
      'Deletar Categoria',
      `Tem certeza que quer deletar a categoria "${categoryName}"? Todos os itens dentro dela também serão removidos.`,
      executeDelete
    );
  };

  // --- LÓGICA DRAG AND DROP ---
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return combine(
      autoScrollForElements({
        element: container,
      }),
      dropTargetForElements({
        element: container,
        canDrop: ({ source }) => source.data.type === 'category-item',
        onDrop: async ({ source, location }) => {
          const target = location.current.dropTargets.find(
            (target) => target.data.type !== 'container'
          );

          if (!target) {
            return;
          }
          
          const sourceId = source.data.categoryId;
          const targetId = target.data.categoryId;
          const closestEdge = extractClosestEdge(target.data);

          const startIndex = orderedCategories.findIndex(c => c.id === sourceId);
          const finishIndex = orderedCategories.findIndex(c => c.id === targetId);

          if (startIndex < 0 || finishIndex < 0) {
            return; // Should not happen
          }

          const newOrder = reorder({
            list: orderedCategories,
            startIndex,
            finishIndex: closestEdge === 'bottom' ? finishIndex + 1 : finishIndex,
          });

          const newOrderWithUpdatedSort = newOrder.map((category, index) => ({ ...category, order: index }));

          setOrderedCategories(newOrderWithUpdatedSort);

          try {
            const orderedIds = newOrderWithUpdatedSort.map(c => c.id);
            await apiFetch(`/categories/reorder`, {
              method: 'PUT',
              body: JSON.stringify({ listId: list.id, orderedCategoryIds: orderedIds }),
            });
            onUpdateList(prev => ({...prev, categories: newOrderWithUpdatedSort}));
            showToast({ message: 'Ordem das categorias salva!', type: 'success' });
          } catch (err) {
            showToast({ message: 'Erro ao salvar a nova ordem.', type: 'error' });
            setOrderedCategories(orderedCategories);
          }
        },
      })
    );
  }, [orderedCategories, list.id, onUpdateList, showToast]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={handleClose}>
      <div
        className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Gerenciar Categorias</h2>

        <h3 className="text-lg font-semibold mb-2">Adicionar Nova Categoria</h3>
        <form onSubmit={handleCreateCategory} className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newCategoryIcon}
            onChange={(e) => setNewCategoryIcon(e.target.value)}
            placeholder="Ex: 🍳"
            maxLength={5}
            className="block w-16 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ex: Cozinha"
            required
            maxLength={50}
            pattern={nameValidationRegex}
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

        <h3 className="text-lg font-semibold mb-2">Categorias Atuais</h3>
        <div ref={containerRef} className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {orderedCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma categoria criada.</p>
          ) : (
            orderedCategories.map(category => (
              <DraggableCategory 
                key={category.id} 
                category={category} 
                onDeleteCategory={handleDeleteCategory} 
              />
            ))
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}