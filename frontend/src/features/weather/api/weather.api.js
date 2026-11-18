function getErrorMessage(status, error) {
  switch (error?.code) {
    case 'INVALID_CEP':
      return 'CEP inválido. Informe oito dígitos, com ou sem hífen.';
    case 'CEP_NOT_FOUND':
      return 'CEP não encontrado.';
    case 'CITY_NOT_IDENTIFIED':
      return 'Cidade não localizada para o CEP informado.';
    case 'CONNECTION_ERROR':
      return error.message || 'Falha de conexão. Verifique sua conexão e tente novamente.';
    case 'EXTERNAL_API_ERROR':
    case 'INVALID_EXTERNAL_RESPONSE':
    case 'EXTERNAL_SERVICE_UNAVAILABLE':
    case 'EXTERNAL_API_TIMEOUT':
      return 'O serviço de previsão está indisponível. Tente novamente mais tarde.';
  }

  if (status >= 500 && (!error?.code || error.code === 'HTTP_ERROR')) {
    return 'Backend indisponível. Tente novamente mais tarde.';
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export async function getWeatherByCep(cep) {
  let response;

  try {
    response = await fetch(`/api/weather/${encodeURIComponent(cep)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('Falha de conexão. Verifique sua conexão e tente novamente.');
  }

  let weatherData;

  try {
    weatherData = await response.json();
  } catch {
    throw new Error(getErrorMessage(response.status));
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, weatherData?.error));
  }

  return weatherData;
}
