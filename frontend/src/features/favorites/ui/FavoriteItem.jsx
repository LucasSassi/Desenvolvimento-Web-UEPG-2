import { useId, useRef, useState } from 'react';
import { deleteFavorite, updateFavorite } from '../api/favorites.api';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';

export function FavoriteItem({ favorite, onUpdated, onDeleted, onSearch, isWeatherLoading }) {
  const nameId = useId();
  const busy = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(favorite.name);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const formattedCep = `${favorite.cep.slice(0, 5)}-${favorite.cep.slice(5)}`;

  async function handleSave(event) {
    event.preventDefault();
    if (busy.current) return;
    setError(null);
    if (!name.trim() || name.trim().length > 80) {
      setError('Informe um nome de 1 a 80 caracteres.');
      return;
    }
    busy.current = true;
    setPending('save');
    try {
      onUpdated(await updateFavorite(favorite.id, name.trim()));
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  async function handleDelete() {
    if (busy.current || !window.confirm(`Excluir "${favorite.name}" (${formattedCep}) dos favoritos?`)) return;
    busy.current = true;
    setPending('delete');
    setError(null);
    try {
      await deleteFavorite(favorite.id);
      onDeleted(favorite.id);
    } catch (error) {
      setError(error.message);
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  function startEditing() {
    setName(favorite.name);
    setError(null);
    setIsEditing(true);
  }

  return (
    <li className="space-y-3 rounded-2xl border border-gray-200 p-4" aria-busy={Boolean(pending)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-semibold text-gray-900">{favorite.name}</h3>
          <p className="text-sm text-gray-600">{formattedCep}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onSearch(favorite.cep)} disabled={isWeatherLoading}
            aria-label={`Consultar previsão de ${favorite.name}`}>Consultar previsão</Button>
          {!isEditing && <Button onClick={startEditing} disabled={Boolean(pending)}
            aria-label={`Editar nome de ${favorite.name}`}>Editar nome</Button>}
          <Button onClick={handleDelete} disabled={Boolean(pending)}
            aria-label={`Excluir ${favorite.name}`}>{pending === 'delete' ? 'Excluindo...' : 'Excluir'}</Button>
        </div>
      </div>
      {isEditing && (
        <form onSubmit={handleSave} className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <label htmlFor={nameId} className="block text-sm font-semibold">Novo nome</label>
            <Input id={nameId} autoFocus required maxLength={80} value={name}
              onChange={(event) => setName(event.target.value)} disabled={Boolean(pending)} className="w-full" />
          </div>
          <Button type="submit" disabled={Boolean(pending)}>{pending === 'save' ? 'Salvando...' : 'Salvar'}</Button>
          <Button disabled={Boolean(pending)} onClick={() => { setIsEditing(false); setError(null); }}>Cancelar</Button>
        </form>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </li>
  );
}
