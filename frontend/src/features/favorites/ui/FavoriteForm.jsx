import { useId, useRef, useState } from 'react';
import { createFavorite } from '../api/favorites.api';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';

export function FavoriteForm({ disabled, onCreated }) {
  const fieldId = useId();
  const busy = useRef(false);
  const [cep, setCep] = useState('');
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy.current || disabled) return;
    setError(null);
    const trimmedName = name.trim();
    if (!/^\d{5}-?\d{3}$/.test(cep) || !trimmedName || trimmedName.length > 80) {
      setError('Informe um CEP válido e um nome de 1 a 80 caracteres.');
      return;
    }
    busy.current = true;
    setIsSaving(true);
    try {
      const favorite = await createFavorite({ cep: cep.replace('-', ''), name: trimmedName });
      onCreated(favorite);
      setCep('');
      setName('');
    } catch (error) {
      setError(error.message);
    } finally {
      busy.current = false;
      setIsSaving(false);
    }
  }

  function handleCepChange(event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
    setCep(digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isSaving} className="space-y-3">
      <fieldset disabled={disabled || isSaving} className="flex flex-wrap items-end gap-3">
        <legend className="sr-only">Adicionar CEP favorito</legend>
        <div className="space-y-1">
          <label htmlFor={`${fieldId}-cep`} className="block text-sm font-semibold text-gray-700">CEP favorito</label>
          <Input id={`${fieldId}-cep`} name="cep" inputMode="numeric" autoComplete="postal-code"
            placeholder="00000-000" maxLength={9} required pattern="[0-9]{5}-?[0-9]{3}"
            value={cep} onChange={handleCepChange} className="w-44" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <label htmlFor={`${fieldId}-name`} className="block text-sm font-semibold text-gray-700">Nome da localização</label>
          <Input id={`${fieldId}-name`} name="name" placeholder="Casa, Trabalho..." required maxLength={80}
            value={name} onChange={(event) => setName(event.target.value)} className="w-full" />
        </div>
        <Button type="submit">{isSaving ? 'Adicionando...' : 'Adicionar'}</Button>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
