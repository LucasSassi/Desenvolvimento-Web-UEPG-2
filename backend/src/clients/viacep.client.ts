import { AppError } from '../errors/app.error.js';
import { viaCepResponseSchema, type ViaCepLocation } from '../types/location.types.js';
import { fetchJson } from './http.client.js';

export async function getAddress(cep: string): Promise<ViaCepLocation> {
  const data = await fetchJson(new URL(`https://viacep.com.br/ws/${cep}/json/`), viaCepResponseSchema, 'ViaCEP');
  if ('erro' in data && (data.erro === true || data.erro === 'true')) {
    throw new AppError(404, 'CEP_NOT_FOUND', 'O CEP informado não foi encontrado.');
  }
  if (!('cep' in data) || data.cep.replace('-', '') !== cep) {
    throw new AppError(502, 'INVALID_EXTERNAL_RESPONSE', 'ViaCEP retornou uma resposta inválida.');
  }
  return data;
}
