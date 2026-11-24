import { useId, useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { AddressCepFinder } from './AddressCepFinder';

const CEP_DIGITS = 8;
const CEP_PREFIX_DIGITS = 5;

export function CepSearch({ onSearch, isLoading }) {
  const [cep, setCep] = useState('');
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const inputId = useId();
  const hintId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    onSearch(cep);
  }

  function handleCepChange(event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, CEP_DIGITS);
    const masked = digits.length > CEP_PREFIX_DIGITS
      ? `${digits.slice(0, CEP_PREFIX_DIGITS)}-${digits.slice(CEP_PREFIX_DIGITS)}`
      : digits;
    setCep(masked);
  }

  function handleSelectFoundCep(foundCep) {
    setCep(foundCep);
    setIsFinderOpen(false);
    onSearch(foundCep);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-3">
        <div className="flex items-baseline gap-2.5">
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
            CEP
          </label>
          <button
            type="button"
            aria-expanded={isFinderOpen}
            onClick={() => setIsFinderOpen((prev) => !prev)}
            className="text-xs font-medium text-blue-600 transition hover:text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Não sabe o CEP?
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            id={inputId}
            name="cep"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            aria-describedby={hintId}
            placeholder="00000-000"
            maxLength={CEP_DIGITS + 1}
            value={cep}
            onChange={handleCepChange}
            disabled={isLoading}
            className="w-48 text-lg tracking-wider"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {isLoading ? 'Consultando' : 'Consultar'}
          </Button>
        </div>

        <p id={hintId} className="text-sm text-gray-500">
          Informe oito dígitos, com ou sem hífen. Exemplo: 84010-000.
        </p>
      </form>

      {isFinderOpen && (
        <AddressCepFinder
          onSelectCep={handleSelectFoundCep}
          onClose={() => setIsFinderOpen(false)}
          disabled={isLoading}
        />
      )}
    </div>
  );
}