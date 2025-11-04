import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api'; // Usamos nosso helper (ele funciona para chamadas públicas)

export default function ListPage() {
  const { slug } = useParams(); // Pega o ':slug' da URL
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        // Chama nosso novo endpoint público
        const data = await apiFetch(`/lists/${slug}`);
        setList(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar lista:", err);
        setError(err.message || 'Erro ao carregar a lista.');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [slug]); // Roda o efeito novamente se o slug mudar

  if (loading) {
    return <p className="text-center text-xl mt-10">Carregando lista...</p>;
  }

  if (error) {
    return <p className="text-center text-xl text-red-600 mt-10">{error}</p>;
  }

  if (!list) {
    return <p className="text-center text-xl mt-10">Lista não encontrada.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho da Lista */}
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{list.title}</h1>
        <p className="text-lg text-gray-600">Criada por {list.user.name}</p>
        {list.description && (
          <p className="text-gray-700 mt-4">{list.description}</p>
        )}
      </div>

      {/* Seção de Itens */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Itens da Lista</h2>
        
        {list.items.length === 0 ? (
          <p className="text-gray-600">Nenhum item foi adicionado a esta lista ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aqui vamos listar os itens no futuro */}
            {list.items.map((item) => (
              <div key={item.id} className="border p-4 rounded-md">
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
