const messages = {
  INVALID_FAVORITE: 'Informe um CEP válido e um nome de 1 a 80 caracteres.',
  INVALID_FAVORITE_ID: 'O identificador deste favorito é inválido.',
  FAVORITE_ALREADY_EXISTS: 'Este CEP já está nos favoritos.',
  FAVORITE_NOT_FOUND: 'Este favorito não existe mais. Atualize a lista e tente novamente.',
  CEP_NOT_FOUND: 'CEP não encontrado.',
  DATABASE_UNAVAILABLE: 'O serviço de favoritos está indisponível. Tente novamente mais tarde.',
  EXTERNAL_API_ERROR: 'Não foi possível validar o CEP. Tente novamente mais tarde.',
  INVALID_EXTERNAL_RESPONSE: 'Não foi possível validar o CEP. Tente novamente mais tarde.',
  EXTERNAL_SERVICE_UNAVAILABLE: 'Não foi possível validar o CEP. Tente novamente mais tarde.',
  EXTERNAL_API_TIMEOUT: 'Não foi possível validar o CEP. Tente novamente mais tarde.',
};

async function requestFavorites(path = '', { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api/favorites${path}`, {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Falha de conexão. Verifique sua conexão e tente novamente.');
  }

  if (response.ok && response.status === 204) return;

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Não foi possível acessar os favoritos. Tente novamente.');
  }
  if (!response.ok) {
    throw new Error(messages[data?.error?.code] || 'Não foi possível acessar os favoritos. Tente novamente.');
  }
  return data;
}

export const listFavorites = (signal) => requestFavorites('', { signal });
export const createFavorite = (input) => requestFavorites('', { method: 'POST', body: input });
export const updateFavorite = (id, name) => requestFavorites(`/${id}`, { method: 'PATCH', body: { name } });
export const deleteFavorite = (id) => requestFavorites(`/${id}`, { method: 'DELETE' });
