import { useId, useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

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
    setCep(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-2">
      <label htmlFor={inputId} className="block font-medium">CEP</label>
      <div className="flex flex-wrap gap-2">
        <Input
          id={inputId}
          name="cep"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          aria-describedby={hintId}
          placeholder="00000-000"
          value={cep}
          onChange={handleCepChange}
          disabled={isLoading}
          className="w-48"
        />
        <Button type="submit" disabled={isLoading}>
          Consultar
        </Button>
      </div>
      <p id={hintId} className="text-sm text-gray-600">Informe oito dígitos, com ou sem hífen.</p>
    </form>
  );
}
