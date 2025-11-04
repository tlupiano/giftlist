// O "baseURL" da nossa API
const API_URL = 'http://localhost:5000/api';

/**
 * Um wrapper de 'fetch' que automaticamente adiciona o token de autenticação.
 * @param {string} endpoint - O endpoint da API (ex: '/lists')
 * @param {object} options - Opções do Fetch (method, body, etc.)
 */
export const apiFetch = async (endpoint, options = {}) => {
  // 1. Pega o token salvo pelo AuthContext
  // --- CORREÇÃO AQUI ---
  // Lendo 'authToken' em vez de 'token'
  const token = localStorage.getItem('authToken');

  // 2. Define os cabeçalhos (headers)
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers, // Permite sobrescrever/adicionar headers
  };

  // 3. Se o token existir, adiciona no cabeçalho Authorization
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 4. Monta as opções finais do fetch
  const config = {
    ...options,
    headers,
  };

  // 5. Faz a requisição
  const response = await fetch(`${API_URL}${endpoint}`, config);

  // 6. Trata a resposta
  if (!response.ok) {
    // Se a resposta não for OK (ex: 401, 404, 500),
    // tenta ler o JSON de erro e o joga como um erro
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Erro na requisição');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // 7. Se for OK, retorna o JSON da resposta
  // Se a resposta não tiver corpo (ex: status 204), retorna null
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  }
  return null;
};
