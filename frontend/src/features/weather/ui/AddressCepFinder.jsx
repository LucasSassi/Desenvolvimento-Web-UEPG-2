import { useId, useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { searchCepByAddress } from '../api/weather.api';

const BRAZILIAN_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export function AddressCepFinder({ onSelectCep, onClose, disabled }) {
  const [uf, setUf] = useState('PR');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const ufId = useId();
  const cityId = useId();
  const streetId = useId();

  async function handleAddressSearch(event) {
    event.preventDefault();
    if (isSearching || disabled) return;

    const trimmedCity = city.trim();
    const trimmedStreet = street.trim();

    if (!uf || trimmedCity.length < 3 || trimmedStreet.length < 3) {
      setError('Selecione a UF e informe cidade e rua com pelo menos 3 letras.');
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(false);

    try {
      const locations = await searchCepByAddress({
        uf,
        city: trimmedCity,
        street: trimmedStreet,
      });
      setResults(locations);
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="rounded-2xl border border-sky-100 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          Consultar CEP pelo endereço
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar busca por endereço"
          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700"
        >
          Fechar
        </button>
      </div>

      <form onSubmit={handleAddressSearch} className="grid gap-3 sm:grid-cols-[88px_1fr_1fr_auto]">
        <div>
          <label htmlFor={ufId} className="sr-only">UF</label>
          <select
            id={ufId}
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            disabled={isSearching || disabled}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {BRAZILIAN_UFS.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={cityId} className="sr-only">Cidade</label>
          <Input
            id={cityId}
            type="text"
            placeholder="Cidade (ex: Ponta Grossa)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isSearching || disabled}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor={streetId} className="sr-only">Logradouro</label>
          <Input
            id={streetId}
            type="text"
            placeholder="Rua / Av. (ex: Carlos Cavalcanti)"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            disabled={isSearching || disabled}
            className="w-full"
          />
        </div>

        <Button type="submit" disabled={isSearching || disabled}>
          {isSearching ? 'Buscando...' : 'Buscar CEP'}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {hasSearched && results.length === 0 && !error && (
        <p className="mt-3 text-xs text-slate-600">
          Nenhum CEP encontrado para o endereço informado.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-slate-600">
            {results.length} endereço(s) encontrado(s). Clique para usar o CEP:
          </p>
          <ul className="max-h-52 divide-y divide-gray-200 overflow-y-auto rounded-xl border border-gray-200 bg-white">
            {results.map((item) => (
              <li key={`${item.cep}-${item.street ?? ''}-${item.neighborhood ?? ''}`}>
                <button
                  type="button"
                  onClick={() => onSelectCep(item.cep)}
                  className="flex w-full flex-col gap-0.5 px-3.5 py-2.5 text-left transition hover:bg-sky-50 focus:bg-sky-50 focus:outline-none sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm text-gray-800">
                    {[item.street, item.neighborhood].filter(Boolean).join(', ') || 'Logradouro não especificado'}
                    {' — '}
                    <span className="text-gray-500">
                      {item.city}/{item.state}
                    </span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-sky-700">
                    {item.cep}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}