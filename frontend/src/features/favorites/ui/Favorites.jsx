import { useEffect, useId, useState } from 'react';
import { listFavorites } from '../api/favorites.api';
import { FavoriteForm } from './FavoriteForm';
import { FavoriteItem } from './FavoriteItem';
import { Button } from '../../../shared/ui/Button';

export function Favorites({ onSearch, isWeatherLoading }) {
  const headingId = useId();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    listFavorites(controller.signal).then((data) => {
      if (!controller.signal.aborted) setFavorites(data);
    }).catch((error) => {
      if (!controller.signal.aborted) setError(error.message);
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [reload]);

  function handleCreated(favorite) {
    setFavorites((current) => [favorite, ...current].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.id - a.id));
    setNotice('Favorito adicionado.');
  }

  function handleUpdated(favorite) {
    setFavorites((current) => current.map((item) => item.id === favorite.id ? favorite : item));
    setNotice('Nome do favorito atualizado.');
  }

  function handleDeleted(id) {
    setFavorites((current) => current.filter((item) => item.id !== id));
    setNotice('Favorito excluído.');
  }

  return (
    <section aria-labelledby={headingId} className="space-y-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="space-y-1">
        <h2 id={headingId} className="text-2xl font-bold text-slate-800">CEPs favoritos</h2>
        <p className="text-sm text-gray-600">Salve um CEP com um nome para consultar novamente. A lista é compartilhada por todos nesta instalação.</p>
      </div>
      <FavoriteForm disabled={isLoading || Boolean(error)} onCreated={handleCreated} />
      <p role="status" aria-live="polite" className="text-sm text-gray-600">
        {isLoading ? 'Carregando favoritos...' : notice}
      </p>
      {error && (
        <div className="space-y-2">
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <Button onClick={() => setReload((value) => value + 1)} disabled={isLoading}>Tentar novamente</Button>
        </div>
      )}
      {!isLoading && !error && favorites.length === 0 && <p className="text-gray-600">Você ainda não tem CEPs favoritos. Adicione o primeiro acima.</p>}
      {!error && favorites.length > 0 && (
        <ul className="space-y-3" aria-label="CEPs salvos">
          {favorites.map((favorite) => <FavoriteItem key={favorite.id} favorite={favorite}
            onUpdated={handleUpdated} onDeleted={handleDeleted} onSearch={onSearch} isWeatherLoading={isWeatherLoading} />)}
        </ul>
      )}
    </section>
  );
}
