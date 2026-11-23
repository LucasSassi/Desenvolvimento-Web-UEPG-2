import { useId, useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

const CEP_DIGITS = 8;
const CEP_PREFIX_DIGITS = 5;

export function CepSearch({ onSearch, isLoading }) {
  const [cep, setCep] = useState('');
  const inputId = useId();
  const hintId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    onSearch(cep);
  }

  function handleCepChange(event) {
    // Máscara 00000-000: mantém só dígitos e insere o hífen depois do quinto.
    const digits = event.target.value.replace(/\D/g, '').slice(0, CEP_DIGITS);
    const masked = digits.length > CEP_PREFIX_DIGITS
      ? `${digits.slice(0, CEP_PREFIX_DIGITS)}-${digits.slice(CEP_PREFIX_DIGITS)}`
      : digits;
    setCep(masked);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isLoading}
      className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700">
        CEP
      </label>
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
  );
}
